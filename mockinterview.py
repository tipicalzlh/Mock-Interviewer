from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
import os
client = OpenAI(api_key='sk-WsCSVclimZaUZQ3ZFbFv8W45IMwNMN6LZ1DEuzQLPST3BlbkFJmG3DcHezmlJuRRAftVBa8BE4emefZinM16HP1sAjwA')


app = Flask(__name__)
app.secret_key = os.urandom(24)  # Needed for session management

@app.route('/')
def index():
    # Clear previous session data
    session.clear()
    return render_template('CVBuilder.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')

    # Check if a job role has been selected and stored in session
    if 'job_role' not in session:
        return jsonify({'reply': 'Please select a job role first.'})

    job_role = session['job_role']

    # Construct the initial messages context for ChatCompletion
    if 'conversation_history' not in session:
        session['conversation_history'] = [
            {"role": "system", "content": f"You are conducting a mock interview for the role of {job_role}.  Ask technical questions relevant to the selected job role. Provide constructive feedback after each answer."}
        ]

    # Store the user message in the conversation history to maintain context
    conversation_history = session['conversation_history']
    conversation_history.append({"role": "user", "content": user_message})

    # Generate GPT response
    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",  # Use the latest and correct model
        messages=conversation_history,
        max_tokens=1000
    )

    agent_reply = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": agent_reply})

    # Update the conversation history in the session
    session['conversation_history'] = conversation_history

    return jsonify({'reply': agent_reply})

@app.route('/set_job_role', methods=['POST'])
def set_job_role():
    job_role = request.json.get('job_role')
    if not job_role:
        return jsonify({'reply': 'Please enter a valid job role.'})
    session['job_role'] = job_role
    return jsonify({'reply': f'You have selected the {job_role} position. Would you like to begin the interview now?'})


if __name__ == '__main__':
    app.run(debug=True)
