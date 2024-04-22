import random
import json
from datetime import datetime, timedelta

# Define the names, issues, user types, and status choices
names = [
    "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Henry", "Ivy", "Jack",
    "Laura", "Max", "Nora", "Oscar", "Pamela", "Quincy", "Rita", "Steve", "Tina", "Mike"
]
issues = ["Feedback", "Issue"]
user_types = ["Student", "Faculty", "Staff", "Visitor"]
statuses = ["Open", "Closed"]

# Function to generate a random timestamp within the last year
def random_timestamp():
    return datetime.now() - timedelta(days=random.randint(0, 365), hours=random.randint(0, 23), minutes=random.randint(0, 59))

# Function to generate random comments
def generate_comments(name):
    admin_texts = [
    "Thank you for reaching out. Could you please confirm your account number?",
    "We have received your query and are investigating the issue.",
    "Could you please provide more detail about the problem you are experiencing?",
    "We apologize for the inconvenience. We are working to resolve the issue as quickly as possible.",
    "Please ensure that you have followed all troubleshooting steps in the help section.",
    "We need a bit more information to assist you better. Could you describe what happened before the error appeared?",
    "Your request has been escalated to our technical team. We will update you as soon as we have more information.",
    "Can you please send us a screenshot of the error message you received?",
    "It appears to be a known issue, and we are currently working on a patch.",
    "Please check that your software is updated to the latest version to ensure compatibility."
]

    user_texts = [
    "Here is the error message I received. I have attached a screenshot as well.",
    "I have already tried the steps outlined in your help section but the problem persists.",
    "This is becoming quite problematic as it is affecting my workflow significantly.",
    "I did update recently, but that seems to have made the problem worse.",
    "Here is my account number and the details of the last transaction I attempted.",
    "The issue occurred right after the latest system update was installed.",
    "I have not encountered this problem before the most recent change you made.",
    "Can you tell me when I can expect an update on this?",
    "Thank you for the quick response. Looking forward to your update.",
    "I am attaching additional details that might help you resolve this quicker."
]

    comments = []
    for _ in range(random.randint(1, 3)):  # Generate 1 to 3 comment exchanges
        comments.append({"author": "Admin", "text": random.choice(admin_texts), "timestamp": random_timestamp().strftime('%Y-%m-%d %H:%M:%S')})
        comments.append({"author": name, "text": random.choice(user_texts), "timestamp": random_timestamp().strftime('%Y-%m-%d %H:%M:%S')})
    return json.dumps(comments)

# Generate the SQL insert statements
print("INSERT INTO feedbacks (name, email, phone, issue_type, user_type, description, ticket_number, created_at, status, comments) VALUES")
values = []
for _ in range(60):
    name = random.choice(names)
    email = f"{name.lower()}{random.randint(10, 99)}@example.com"
    phone = f"{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
    issue_type = random.choice(issues)
    user_type = random.choice(user_types)
    description = f"Reported issue with {random.choice(issues).lower()}."
    ticket_number = f"TICKET-{random.randint(1000000000000, 9999999999999)}"
    created_at = random_timestamp().strftime('%Y-%m-%d %H:%M:%S')
    status = random.choice(statuses)
    comments = generate_comments(name)
    values.append(f"('{name}', '{email}', '{phone}', '{issue_type}', '{user_type}', '{description}', '{ticket_number}', '{created_at}', '{status}', '{comments}')")

# Join all values with comma and print
print(",\n".join(values) + ";")
