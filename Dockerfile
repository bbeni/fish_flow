# Use the official Node.js image as the base image
FROM node:14


# conda and whisper stuff installing
RUN apt update
RUN apt install ffmpeg -y
RUN apt-get install git -y
ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"
RUN apt-get update
RUN apt-get install -y wget && rm -rf /var/lib/apt/lists/*
RUN wget \
    https://repo.anaconda.com/miniconda/Miniconda3-py310_23.1.0-1-Linux-x86_64.sh \
    && mkdir /root/.conda \
    && bash Miniconda3-py310_23.1.0-1-Linux-x86_64.sh -b \
    && rm -f Miniconda3-py310_23.1.0-1-Linux-x86_64.sh
RUN conda --version
COPY ./python-backend/environment.yml .
RUN conda env create -f environment.yml
SHELL ["conda", "run", "-n", "tester", "/bin/bash", "-c"]
RUN pip install "git+https://github.com/openai/whisper.git"
RUN python -c "import whisper; model = whisper.load_model('tiny.en' )"


# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install


# Copy the rest of the application files into the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]