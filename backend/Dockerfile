# Step 1: Use a Node.js base image
FROM node:14 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Step 2: Copy necessary files and directories into the Docker container
# Exclude node_modules by using a .dockerignore file (will discuss this below)
COPY ./backend/package*.json ./
COPY ./backend/process_article.py .
COPY ./backend/server.js .
COPY ./backend/.env .

# Step 3: Install node modules 
RUN npm install

# If you have Python dependencies for process_article.py, you can install them here
# Assuming you have a requirements.txt (if not, create one using `pip freeze > requirements.txt` in your backend folder)
COPY ./backend/requirements.txt .
RUN apt-get update && apt-get install -y python3-pip
RUN pip3 install -r requirements.txt

# Step 4: Specify the command to run
CMD [ "node", "server.js" ]
