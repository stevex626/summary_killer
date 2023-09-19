# Step 1: Use a Node.js base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Adjust the PATH to prioritize /usr/local/bin
ENV PATH="/usr/local/bin:${PATH}"

# Step 2: Copy necessary files and directories into the Docker container
COPY package*.json ./
COPY process_article.py .
COPY server.js .

# Step 3: Install node modules 
RUN npm install

# Install system dependencies for building Python
RUN apt-get update && apt-get install -y wget build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev curl

# Download, compile, and install Python 3.11.5
RUN wget https://www.python.org/ftp/python/3.11.5/Python-3.11.5.tgz && \
    tar -xvf Python-3.11.5.tgz && \
    cd Python-3.11.5 && \
    ./configure && \
    make altinstall && \
    cd .. && \
    rm -rf Python-3.11.5 && \
    rm Python-3.11.5.tgz

# Set pip3.11 as the default pip version
RUN ln -s /usr/local/bin/pip3.11 /usr/local/bin/pip3
RUN ln -s /usr/local/bin/python3.11 /usr/local/bin/python3


# Copy over and install the Python dependencies
COPY requirements.txt .
RUN pip3.11 install -r requirements.txt

# Cleanup to reduce image size
RUN apt-get remove --purge -y wget build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Step 4: Specify the command to run
CMD [ "node", "server.js" ]
