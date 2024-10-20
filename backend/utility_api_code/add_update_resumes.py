from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import base64
import os
from utility_api_code.DbUtility import *
import re
import datetime
import json
import io
import fitz
from flask_cors import CORS
import configparser

app = Flask(__name__)
CORS(app)

config = configparser.ConfigParser()
config.read('config.ini')

def remove_basic_things(text_data) -> str:
    try:
        bio_list = ['BIO DATA', 'bio data', 'biodata', 'BIODATA', 'CURRICULUM', 'curriculum', 'VITAE', 'vitae']
        text_ = text_data
        for value in bio_list:
            sentence = text_.replace(value, '')
        return text_
    except Exception as e:
        print(str(e))
        raise

def extract_searchable_pdf_text(pdf_b64):
    try:
        chunk_pdf = io.BytesIO(pdf_b64)
        doc = fitz.open(stream=chunk_pdf, filetype="pdf")  # open document
        text_final = ""
        for page in doc:
            text = ''
            text = page.get_text()
            text_final += text
        return text_final
    except Exception as e:
        print(str(e))
        raise

# index_name = "cv_smart_sample_bulkupload"
# index_name_resume = "cvsmart_resume_index"
#Index Info and Roberta Model Path, Initilizing Elasticsearch
index_name_resume = config.get('ELASTIC','index_resume')
model_path = config.get("MODEL_PATHS",'roberta_model')
model = SentenceTransformer(model_path)


# ########################################The Below Code is for LOCAL Elastic Search#################################
# es = Elasticsearch(
#     "https://localhost:9200/",
#     basic_auth=("elastic","nRQoS5+tMtUFrYk1juPG"),
#     ca_certs=r'C:\Users\Jatin.Patil\Desktop\Code\program\CV-Smart\elasticsearch_candidate\http_ca.crt'
# )
# ########################################The Above Code is for LOCAL Elastic Search#################################


########################################The Below Code is for SIT Elastic Search###################################
def elasticConnect():
    """
    The `elasticConnect` function retrieves configuration values for Elasticsearch connection and
    returns an Elasticsearch client object with basic authentication.

    :return: The function `elasticConnect()` is returning an instance of Elasticsearch with the
    specified URL, basic authentication credentials, and default timeout, max retries, and retry on
    timeout settings.
    """
    url = config.get('ELASTIC','url')
    basic_auth0 = config.get('ELASTIC','basic_0')
    basic_auth1 = config.get('ELASTIC','basic_1')
    
    # return Elasticsearch([url], basic_auth=(basic_auth0, basic_auth1),timeout=30, max_retries=10, retry_on_timeout=True)
    return Elasticsearch([url], basic_auth=(basic_auth0, basic_auth1))
########################################The Above Code is for SIT Elastic Search###################################

# print("===============Elastic Search ping check=================")
# print(es.info())
# print(es.ping())
# print("=========================================================")
@app.route('/add_resume', methods=['POST'])
def add_resume():
    try:
        es=elasticConnect()
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = validate_user(UserId,Password)
        if flag == "VALID":
            data_ = request.data
            Data = data_.decode("utf-8")
            data = json.loads(Data)

            candidate_id = data["candidate_id"]
            file_name = data["file_name"]
            file_type = data["file_type"]
            file_content_base64 = data["file_content"]
            primary_id = candidate_id+'_'+UserId
            print(primary_id)
            # Decode base64 to text
            file_content = base64.b64decode(file_content_base64)        
            # Use service to extract pdf file
            text = extract_searchable_pdf_text(file_content)        
            if not text:
                raise ValueError("Extracted text is empty")
            text = remove_basic_things(text)
            text = text.strip()
                        
            # Create embeddings for the resume content
            embeddings = model.encode(text)
            print(embeddings)

            d = {
                "user_id": UserId,
                "primary_id":primary_id,
                "file_type": file_type,
                "file_name": file_name,
                "file_content": text,
                "candidate_id": candidate_id,
                "embeddings": embeddings           

            }        
            
            search_resume_exists= { 

                "query": {
                        "bool": {
                            "must": [
                                    { "match": { "primary_id":  primary_id }  }

                            ]
                        }
                }                        
            }
            resume_results = es.search(index=index_name_resume, body=search_resume_exists)
            hits_result_resume = resume_results["hits"]["hits"] 
            print(hits_result_resume)
            if hits_result_resume:
                return jsonify({"message": "Resume already exists!"}), 200
            else:                    
                # Use the update API to ensure only one entry per resume_id
                es.update(index=index_name_resume, id=primary_id, body={
                    "doc": {
                        "user_id":d["user_id"],
                        "file_type": d["file_type"],
                        "primary_id" : d["primary_id"],
                        "file_name": d["file_name"],
                        "file_content": d["file_content"],
                        "candidate_id": d["candidate_id"],
                        "embeddings": d["embeddings"].tolist()
                    },
                    "doc_as_upsert": True
                })
                return jsonify({"message": "Resume added successfully!"}), 200
        else:
            return jsonify({"message": "User Not Valid"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_resume',methods=['POST'])
def update_resume():
    try:
        es=elasticConnect()
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = validate_user(UserId,Password)
        if flag == "VALID":
            data_ = request.data
            Data = data_.decode("utf-8")
            data = json.loads(Data)
 
            candidate_id = data["candidate_id"]
            file_name = data["file_name"]
            file_type = data["file_type"]
            file_content_base64 = data["file_content"]
            primary_id = candidate_id+'_'+UserId
            # Decode base64 to text
            file_content = base64.b64decode(file_content_base64)        
            # Use service to extract pdf file
            text = extract_searchable_pdf_text(file_content)        
            if not text:
                raise ValueError("Extracted text is empty")
            text = remove_basic_things(text)
            text = text.strip()
            
            # Create embeddings for the resume content
            embeddings = model.encode(text)
            print(embeddings)
 
          
            d = {
                "user_id": UserId,
                "primary_id":primary_id,
                "file_type": file_type,
                "file_name": file_name,
                "file_content": text,
                "candidate_id": candidate_id,
                "embeddings": embeddings           

            }
            search_resume_exists= { 

                "query": {
                        "bool": {
                            "must": [
                                    { "match": { "primary_id":  primary_id }  }

                            ]
                        }
                }                        
            }
            resume_results = es.search(index=index_name_resume, body=search_resume_exists)
            hits_result_resume = resume_results["hits"]["hits"] 

            if hits_result_resume:               
                # Use the update API to ensure only one entry per resume_id
                es.update(index=index_name_resume, id=primary_id, body={
                        "doc": {
                            "user_id":d["user_id"],
                            "file_type":d["file_type"],
                            "primary_d" : d["primary_id"],
                            "file_name": d["file_name"],
                            "file_content": d["file_content"],
                            "candidate_id": d["candidate_id"],
                            "embeddings": d["embeddings"].tolist()
                        },
                        "doc_as_upsert": True
                })
                return jsonify({"message": "Resume Updated successfully!"}), 200
            else:
                return jsonify({"message": "Resume Not Found! "}), 200
        else:
            return jsonify({"message": "User Not Valid"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
port = config.get('ADD_UPDATE_RESUME','port')
host = config.get('ADD_UPDATE_RESUME','host')

if __name__ == '__main__':
    app.run(host=host,debug=False, port=port)
