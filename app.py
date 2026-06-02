from flask import Flask, render_template, request, jsonify, send_file
import sqlite3
import os
from datetime import datetime
import random
from auth import auth
from flask import session, redirect
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

from functools import wraps

app = Flask(__name__)
app.secret_key = "healthcare_secret"
app.register_blueprint(auth)

DATABASE = "healthcare.db"
REPORT_FOLDER = "reports"

if not os.path.exists(REPORT_FOLDER):
    os.makedirs(REPORT_FOLDER)


def admin_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if session.get("role") != "admin":
            return jsonify({"error":"Admin Only"})

        return f(*args, **kwargs)

    return decorated
# ===============================
# DATABASE INITIALIZATION
# ===============================
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        heart_rate INTEGER,
        bp TEXT,
        temperature REAL,
        oxygen INTEGER,
        symptoms TEXT,
        risk TEXT,
        date TEXT
    )
    """
    )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT,
        medicine TEXT,
        time TEXT
    )
    """
    )

    cursor.execute(
        """
CREATE TABLE IF NOT EXISTS medicines(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
medicine TEXT,
exp TEXT,
photo TEXT
)
"""
    )

    conn.commit()
    conn.close()


init_db()

# ===============================
# ML MODEL TRAINING
# ===============================
MODEL_FILE = "elderly_model.pkl"


def train_model():
    if os.path.exists(MODEL_FILE):
        return joblib.load(MODEL_FILE)

    try:
        df = pd.read_csv("elderly_health_dataset.csv")

        # features
        X = df[["heart_rate", "temperature", "oxygen"]]

        # target
        y = df["risk"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestClassifier(n_estimators=100)
        model.fit(X_train, y_train)

        joblib.dump(model, MODEL_FILE)

        print("ML Model trained successfully")
        return model

    except Exception as e:
        print("ML training error:", e)
        return None


ml_model = train_model()


# ===============================
# AI RISK PREDICTION
# ===============================
def predict_risk(hr, temp, oxygen):
    try:
        hr = int(hr)
        temp = float(temp)
        oxygen = int(oxygen)

        if ml_model:
            pred = ml_model.predict([[hr, temp, oxygen]])
            return str(pred[0])

    except:
        pass

    # fallback rule based
    if hr > 110 or temp > 101 or oxygen < 92:
        return "HIGH RISK"
    elif hr > 95 or temp > 99:
        return "MEDIUM RISK"
    else:
        return "LOW RISK"


# ===============================
# AI DIAGNOSIS
# ===============================
def ai_diagnosis(hr, temp, oxygen, symptoms):
    result = []
    if hr > 110:
        result.append("Possible Tachycardia")
    if temp > 101:
        result.append("Possible Fever")
    if oxygen < 92:
        result.append("Low Oxygen")
    if symptoms and "chest" in symptoms.lower():
        result.append("Possible Heart Issue")
    if not result:
        result.append("Stable Condition")
    return ", ".join(result)


# ===============================
# HOME PAGE
# ===============================
@app.route("/")
def index():

    if "user" not in session:
        return redirect("/login")

    return render_template(
        "index.html",
        role=session["role"]
    )


# ===============================
# ADD PATIENT
# ===============================
@app.route("/add_patient", methods=["POST"])
def add_patient():
    data = request.get_json(force=True)  # safer JSON parsing
    required_fields = [
        "name",
        "age",
        "gender",
        "heart_rate",
        "bp",
        "temperature",
        "oxygen",
        "symptoms",
    ]

    # check missing fields
    for f in required_fields:
        if f not in data:
            return jsonify({"status": "error", "msg": f"Missing field {f}"}), 400

    name = data["name"]
    age = data["age"]
    gender = data["gender"]
    heart_rate = data["heart_rate"]
    bp = data["bp"]
    temperature = data["temperature"]
    oxygen = data["oxygen"]
    symptoms = data["symptoms"]

    risk = predict_risk(heart_rate, temperature, oxygen)
    diagnosis = ai_diagnosis(heart_rate, temperature, oxygen, symptoms)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
    INSERT INTO patients 
    (name, age, gender, heart_rate, bp, temperature, oxygen, symptoms, risk, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            name,
            age,
            gender,
            heart_rate,
            bp,
            temperature,
            oxygen,
            symptoms,
            risk,
            datetime.now().strftime("%Y-%m-%d %H:%M"),
        ),
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "success", "risk": risk, "diagnosis": diagnosis})


# ===============================
# GET PATIENTS
# ===============================
@app.route("/get_patients")
def get_patients():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients ORDER BY id DESC")
    data = cursor.fetchall()
    conn.close()

    patients = []
    for row in data:
        patients.append(
            {
                "id": row[0],
                "name": row[1],
                "age": row[2],
                "gender": row[3],
                "heart_rate": row[4],
                "bp": row[5],
                "temperature": row[6],
                "oxygen": row[7],
                "symptoms": row[8],
                "risk": row[9],
                "date": row[10],
            }
        )

    return jsonify(patients)


# ===============================
# CHART DATA
# ===============================
@app.route("/chart_data")
def chart_data():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT heart_rate, temperature, oxygen, date 
    FROM patients ORDER BY id DESC LIMIT 10
    """
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)


# ===============================
# 24 HR PREDICTION
# ===============================
@app.route("/predict_24hr")
def predict_24hr():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT heart_rate, temperature, oxygen
    FROM patients WHERE heart_rate IS NOT NULL
    ORDER BY id DESC LIMIT 5
    """
    )
    data = cursor.fetchall()
    conn.close()

    if not data:
        return jsonify({"msg": "No data"})

    hr = sum([d[0] for d in data]) / len(data)
    temp = sum([d[1] for d in data]) / len(data)
    oxy = sum([d[2] for d in data]) / len(data)

    return jsonify(
        {
            "heart_rate": round(hr + random.randint(-3, 3), 1),
            "temperature": round(temp + random.uniform(-0.3, 0.3), 1),
            "oxygen": round(oxy + random.randint(-1, 1), 1),
        }
    )


# ===============================
# CHATBOT
# ===============================
@app.route("/chatbot", methods=["POST"])
def chatbot():
    msg = request.json.get("message", "").lower()
    if "fever" in msg:
        reply = "Monitor temperature and drink water."
    elif "medicine" in msg:
        reply = "Please take medicine on time."
    elif "oxygen" in msg:
        reply = "Check oxygen level."
    else:
        reply = "Patient looks stable."
    return jsonify({"reply": reply})


# ===============================
# ANOMALY
# ===============================
@app.route("/anomaly")
def anomaly():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT heart_rate, temperature, oxygen FROM patients ORDER BY id DESC LIMIT 1"
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"status": "No data"})

    hr, temp, oxy = row
    status = "ABNORMAL" if hr > 120 or temp > 102 or oxy < 90 else "NORMAL"
    return jsonify({"status": status})


# ===============================
# REMINDER
# ===============================
@app.route("/add_reminder", methods=["POST"])
def add_reminder():
    data = request.get_json(force=True)
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO reminders (patient_name, medicine, time) VALUES (?,?,?)",
        (data["name"], data["medicine"], data["time"]),
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "reminder added"})


@app.route("/get_reminders")
def get_reminders():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders ORDER BY id DESC")
    data = cursor.fetchall()
    conn.close()
    reminders = []
    for r in data:
        reminders.append({"id": r[0], "name": r[1], "medicine": r[2], "time": r[3]})
    return jsonify(reminders)


# ===============================
# SOS
# ===============================
@app.route("/sos", methods=["POST"])
def sos():
    data = request.get_json(force=True)
    contact = data.get("contact", "+919999999999")
    message = f"🚨 EMERGENCY ALERT\nPatient needs help immediately!"
    print("Sending SOS to:", contact)
    print(message)
    # TODO: Integrate with Twilio/SMS
    return jsonify({"status": f"Emergency alert sent to {contact}"})


# ===============================
# MULTI PATIENT
# ===============================
@app.route("/multi_patient")
def multi_patient():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT p.name, p.heart_rate, p.bp, p.temperature, p.oxygen, p.risk
        FROM patients p
        INNER JOIN (
            SELECT name, MAX(id) as max_id
            FROM patients
            GROUP BY name
        ) latest
        ON p.id = latest.max_id
        ORDER BY p.id DESC
    """
    )

    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append(
            {
                "name": r[0],
                "heart_rate": r[1],
                "bp": r[2],
                "temperature": r[3],
                "oxygen": r[4],
                "risk": r[5],
            }
        )

    return jsonify(result)


# ===============================
# PDF REPORT
# ===============================
@app.route("/generate_report/<name>")
def generate_report(name):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM patients WHERE name=? ORDER BY id DESC LIMIT 1", (name,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return "No data found"

    file_path = os.path.join(
        REPORT_FOLDER, f"doctor_report_{name}_{datetime.now().timestamp()}.pdf"
    )
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("AI Healthcare Doctor Report", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Patient Name: {row[1]}", styles["Normal"]))
    story.append(Paragraph(f"Age: {row[2]}", styles["Normal"]))
    story.append(Paragraph(f"Heart Rate: {row[4]}", styles["Normal"]))
    story.append(Paragraph(f"Temperature: {row[6]}", styles["Normal"]))
    story.append(Paragraph(f"Oxygen: {row[7]}", styles["Normal"]))
    story.append(Paragraph(f"Risk: {row[9]}", styles["Normal"]))

    doc = SimpleDocTemplate(file_path, pagesize=letter)
    doc.build(story)
    return send_file(file_path, as_attachment=True)


# ===============================
# DELETE PATIENT
# ===============================
@app.route("/delete_patient/<name>", methods=["DELETE"])
def delete_patient(name):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients WHERE name=?", (name,))
    conn.commit()
    conn.close()
    return jsonify({"status": "Patient Deleted"})


# ===============================
# FOOD SUGGESTION AI
# ===============================
def food_suggestion(symptoms, risk):
    symptoms = (symptoms or "").lower()

    healthy = []
    avoid = []

    # Diabetes
    if "diabetes" in symptoms:
        healthy += ["Brown rice", "Oats", "Green vegetables", "Nuts", "Dal"]
        avoid += ["Sugar", "White rice", "Sweets", "Soft drinks"]

    # BP / Heart
    if "bp" in symptoms or "pressure" in symptoms or "heart" in symptoms:
        healthy += ["Banana", "Oats", "Spinach", "Low salt food", "Fruits"]
        avoid += ["Salt", "Fried food", "Pickle", "Junk food"]

    # Fever
    if "fever" in symptoms:
        healthy += ["Soup", "Coconut water", "Rice porridge", "Fruits"]
        avoid += ["Fried food", "Cold drinks"]

    # Low Oxygen
    if "oxygen" in symptoms:
        healthy += ["Beetroot", "Spinach", "Pomegranate", "Carrot"]
        avoid += ["Smoking", "Oily food"]

    # Default
    if not healthy:
        healthy = ["Balanced diet", "Fruits", "Vegetables", "Protein food"]
        avoid = ["Junk food", "Excess oil", "Sugary food"]

    return healthy, avoid


@app.route("/food_suggestion/<name>")
def get_food(name):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        """
    SELECT symptoms, risk 
    FROM patients 
    WHERE name=? 
    ORDER BY id DESC LIMIT 1
    """,
        (name,),
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"healthy": [], "avoid": []})

    symptoms, risk = row

    healthy, avoid = food_suggestion(symptoms, risk)

    return jsonify({"healthy": healthy, "avoid": avoid})


@app.route("/add_medicine", methods=["POST"])
def add_medicine():

    name = request.form["name"]
    medicine = request.form["medicine"]
    exp = request.form["exp"]

    file = request.files["photo"]
    filename = str(datetime.now().timestamp()) + "_" + file.filename
    path = os.path.join("static", filename)

    if not os.path.exists("static"):
        os.makedirs("static")

    file.save(path)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO medicines(name,medicine,exp,photo) VALUES (?,?,?,?)",
        (name, medicine, exp, path),
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})


@app.route("/get_medicine")
def get_medicine():

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medicines ORDER BY id DESC")
    data = cursor.fetchall()
    conn.close()

    medicines = []
    for m in data:
        medicines.append({"name": m[1], "medicine": m[2], "exp": m[3], "photo": m[4]})

    return jsonify(medicines)


@app.route("/ml_accuracy")
def ml_accuracy():
    try:
        df = pd.read_csv("elderly_health_dataset.csv")

        X = df[["heart_rate", "temperature", "oxygen"]]
        y = df["risk"]

        from sklearn.metrics import accuracy_score
        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestClassifier()
        model.fit(X_train, y_train)

        pred = model.predict(X_test)

        acc = accuracy_score(y_test, pred)

        return jsonify({"accuracy": round(acc * 100, 2)})

    except Exception as e:
        return jsonify({"error": str(e)})


# ===============================
# SMART SEARCH
# ===============================
@app.route("/search_patient")
def search_patient():

    keyword = request.args.get("q", "").strip()

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM patients
    WHERE
        name LIKE ?
        OR risk LIKE ?
        OR symptoms LIKE ?
        OR gender LIKE ?
        OR CAST(age AS TEXT) LIKE ?
    ORDER BY id DESC
    """,
    (
        f"%{keyword}%",
        f"%{keyword}%",
        f"%{keyword}%",
        f"%{keyword}%",
        f"%{keyword}%"
    ))

    rows = cursor.fetchall()
    conn.close()

    result = []

    for row in rows:
        result.append({
            "id": row[0],
            "name": row[1],
            "age": row[2],
            "gender": row[3],
            "heart_rate": row[4],
            "bp": row[5],
            "temperature": row[6],
            "oxygen": row[7],
            "symptoms": row[8],
            "risk": row[9],
            "date": row[10]
        })

    return jsonify(result)

# ===============================
# RUN
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
