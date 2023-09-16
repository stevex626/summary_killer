# Step 1: Use a Node.js base image
FROM node:14 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Step 2: Copy necessary files and directories into the Docker container
COPY package*.json ./
COPY process_article.py .
COPY server.js .

# Step 3: Install node modules 
RUN npm install

RUN apt-get update && apt-get install -y python3-pip

# Copy over and install the Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Step 4: Specify the command to run
CMD [ "node", "server.js" ]
