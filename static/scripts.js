function startInterview() {
    const cvUpload = document.getElementById('cvUpload');
    if (cvUpload.files.length > 0) {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('jobRoleSection').style.display = 'block';
    } else {
        alert("Please upload your CV to proceed.");
    }
}

function chooseJobRole() {
    const jobRole = document.getElementById('jobRoleInput').value;
    // Send job role to the server
    fetch('/set_job_role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_role: jobRole })
    })
    .then(response => response.json())
    .then(data => {
        // Add the server's response as an agent's message
        addAgentMessageToChatBox(data.reply);
        if (data.reply.includes('You have selected')) {
            // Proceed to chat section
            document.getElementById('jobRoleSection').style.display = 'none';
            document.getElementById('chatSection').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));
}

function addAgentMessageToChatBox(message) {
    const chatBox = document.getElementById('chatBox');
    const agentMessage = document.createElement('div');
    agentMessage.className = 'message agent-message';
    agentMessage.innerText = message;
    chatBox.appendChild(agentMessage);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    if (messageText) {
        displayMessage(messageText, 'user');
        messageInput.value = '';

        // Send message to the server
        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageText })
        })
        .then(response => response.json())
        .then(data => {
            if (data.reply) {
                displayMessage(data.reply, 'agent');
            }
        });
    }
}

function displayMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('user-message');
        messageDiv.style.alignSelf = 'flex-end';
    } else {
        messageDiv.classList.add('agent-message');
        messageDiv.style.alignSelf = 'flex-start';
    }

    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
