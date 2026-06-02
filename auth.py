from flask import Blueprint, render_template, request, redirect, session, jsonify

auth = Blueprint("auth", __name__)

USERS = {
    "admin": {
        "password": "admin123",
        "role": "admin"
    },
    "doctor": {
        "password": "doctor123",
        "role": "doctor"
    },
    "patient": {
        "password": "patient123",
        "role": "patient"
    }
}

@auth.route("/login")
def login_page():
    return render_template("login.html")


@auth.route("/login", methods=["POST"])
def login():

    username = request.form.get("username")
    password = request.form.get("password")

    if username in USERS:

        if USERS[username]["password"] == password:

            session["user"] = username
            session["role"] = USERS[username]["role"]

            return redirect("/")

    return "Invalid Login"


@auth.route("/logout")
def logout():

    session.clear()

    return redirect("/login")