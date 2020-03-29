FROM node:latest

# Copy the current directory contents into the container at /app
ADD . /app

WORKDIR /app