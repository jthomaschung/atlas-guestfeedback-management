-- Enable http extension for database triggers to send Slack notifications
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;