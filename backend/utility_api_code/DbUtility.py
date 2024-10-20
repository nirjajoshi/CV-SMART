import mysql.connector
import configparser

config = configparser.ConfigParser()
config.read('config.ini')

def get_db_connection():
    connection = mysql.connector.connect(
        host=config.get('DatabaseConn', 'host'),
        port=config.get('DatabaseConn', 'db_port'),
        database=config.get('DatabaseConn', 'database'),
        user=config.get('DatabaseConn', 'user'),
        password=config.get('DatabaseConn', 'password')
    )
    return connection

def validate_user(userid, clientsecretkey):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = "SELECT * FROM users WHERE userid = %s AND clientsecretkey = %s"
    cursor.execute(query, (userid, clientsecretkey))
    user = cursor.fetchone()
    
    cursor.close()
    connection.close()
    
    return "VALID" if user else "INVALID"
