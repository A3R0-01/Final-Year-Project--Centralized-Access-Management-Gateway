FROM python:3.11

ENV PYTHONUNBUFFERED=1

WORKDIR /core_access_management_v2

# Copy requirements first for better caching
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Create a non-root user for security (optional but recommended)
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /core_access_management_v2
USER app

# Expose the port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]