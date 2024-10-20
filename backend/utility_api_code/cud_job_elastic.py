from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import os 
from utility_api_code.DbUtility import *
from flask_cors import CORS
import configparser

app = Flask(__name__)
CORS(app)

# ########################################The Below Code is for LOCAL Elastic Search#################################
# es = Elasticsearch(
#     "https://localhost:9200/",
#     basic_auth=("elastic","nRQoS5+tMtUFrYk1juPG"),
#     ca_certs=r'C:\Users\Jatin.Patil\Desktop\Code\program\CV-Smart\elasticsearch_candidate\http_ca.crt'
# )
# ########################################The Above Code is for LOCAL Elastic Search#################################

config = configparser.ConfigParser()
config.read('config.ini')

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

index_name_jobs = config.get('ELASTIC','index_jobs')  # Name for the jobs index
# index_name_jobs = "job_index_1" #local index 


model_path = config.get("MODEL_PATHS",'roberta_model')
model = SentenceTransformer(model_path)

@app.route('/add_job', methods=['POST'])
def add_job():
    try:
        es=elasticConnect()
        data = request.get_json()
        
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = "VALID"
        
        if flag == "VALID":
            job_id = data["job_id"]
            job_title = data["job_title"]
            job_summary = data["job_summary"]
            job_description = data["job_description"]
            valid_from = data["valid_from"]
            valid_to = data["valid_to"]
            location = data["location"]
            min_ctc = data["min_ctc"]
            max_ctc = data["max_ctc"]
            min_exp = data["min_exp"]
            max_exp = data["max_exp"]
            #primary id logic
            new_id = str(job_id)+'_'+UserId
            # Combine job_title, job_summary, and job_description for content
            job_content = f"{job_title} {job_summary} {job_description}"

            # Create embeddings for the job content
            embeddings = model.encode(job_content)
            search_job_exists= {

                "query": {
                        "bool": {
                            "must": [
                                    { "match": { "user_id":  str(UserId) }},
                                    { "match": { "job_id":  str(job_id)} }
                            ]
                        }
                    }
            }

            search_results_jobs = es.search(index=index_name_jobs, body=search_job_exists)
            results_job = search_results_jobs["hits"]["hits"]
            if(results_job):
                return jsonify({"message": "Job already exists"}), 200
            else:
                # Use the update API to ensure only one entry per job_id
                es.update(index=index_name_jobs, id=new_id, body={
                    "doc": {
                        "user_id": UserId,  # Include the new field
                        "job_id": job_id,
                        "primary_id" : new_id,                    
                        "job_title": job_title,
                        "job_summary": job_summary,
                        "job_description": job_description,
                        "valid_from": valid_from,
                        "valid_to": valid_to,
                        "location": location,
                        "min_ctc": min_ctc,
                        "max_ctc": max_ctc,
                        "min_exp": min_exp,
                        "max_exp": max_exp,
                        "embeddings": embeddings.tolist()
                    },
                    "doc_as_upsert": True
                })

                return jsonify({"message": "Job added successfully!"}), 200
        else:
            return jsonify({"message": "Invalid USER.."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_job',methods=['POST'])
def delete_job():
    try:
        es=elasticConnect()
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = validate_user(UserId,Password)
        print("+++++++++++++++++++++++++++++++++=====",flag)
        if flag == "VALID":
            data = request.get_json()
            job_id = data["job_id"]
            primary_id = str(job_id)+'_'+UserId 
            query = {
                    "query": {
                            "bool": {
                                "must": [
                                    { "match": { "primary_id":  primary_id }  },
    
                                ]
                            }
                    },            
                    "_source": ["job_id","job_title"]
            }
            result = es.search(index=index_name_jobs, body=query)
            print("Result: \n",result)
            if result['hits']['total']['value']==1:
                deleted_jobs = [
                    {"job_id": hit["_source"]["job_id"], "job_title": hit["_source"]["job_title"]}
                    for hit in result["hits"]["hits"]                        
                ]
                es.delete(index=index_name_jobs,id=primary_id)

                return jsonify({"message": "Job deleted successfully!",
                                "search_result": deleted_jobs}), 200
            else:
                return jsonify({"message": "Job Description not present.."})
        else:
            return jsonify({"message": "Invalid USER.."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_job',methods=['POST'])
def update_job():
    try:
        es=elasticConnect()
        data = request.get_json()
        # print("=====================================================",data)
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = validate_user(UserId,Password)
        print("+++++++++++++++++++++++++++++++++",flag,"+++++++++++++++++++++++++++++++")
        if flag == "VALID":
            job_id = data["job_id"]
            job_title = data["job_title"]
            job_summary = data["job_summary"]
            job_description = data["job_description"]
            valid_from = data["valid_from"]
            valid_to = data["valid_to"]
            location = data["location"]
            min_ctc = data["min_ctc"]
            max_ctc = data["max_ctc"]
            min_exp = data["min_exp"]
            max_exp = data["max_exp"]
            #primary id logic
            primary_id = str(job_id)+'_'+UserId
            # Combine job_title, job_summary, and job_description for content
            job_content = f"{job_title} {job_summary} {job_description}"

            # Create embeddings for the job content
            embeddings = model.encode(job_content)
            search_job_exists= {

                "query": {
                        "bool": {
                            "must": [
                                    # { "match": { "user_id":  str(UserId) }},
                                    { "match": { "primary_id":  primary_id} }
                            ]
                        }
                    }
            }

            search_results_jobs = es.search(index=index_name_jobs, body=search_job_exists)
            results_job = search_results_jobs["hits"]["hits"]
            if(results_job):
            # Use the update API to ensure only one entry per job_id
                es.update(index=index_name_jobs, id=primary_id, body={
                    "doc": {
                        "user_id": UserId,  # Include the new field
                        "job_id": job_id,
                        "primary_id" : primary_id,                    
                        "job_title": job_title,
                        "job_summary": job_summary,
                        "job_description": job_description,
                        "valid_from": valid_from,
                        "valid_to": valid_to,
                        "location": location,
                        "min_ctc": min_ctc,
                        "max_ctc": max_ctc,
                        "min_exp": min_exp,
                        "max_exp": max_exp,
                        "embeddings": embeddings.tolist()
                    },
                    "doc_as_upsert": True
                })
                    
                return jsonify({"message": "Job Updated successfully!"}), 200
            else:
                return jsonify({"message": "Job Not found!"}), 200

        else:
            return jsonify({"message": "Invalid USER.."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@app.route('/get_total_jobs', methods=['POST'])
def get_total_jobs():
    try:
        es=elasticConnect()
        UserId = request.headers["userid"]
        Password = request.headers["clientsecretkey"]
        flag = validate_user(UserId, Password)
        print("+++++++++++++++++++++++++++++++++=====", flag)
        if flag == "VALID":
            query = {
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"user_id":  str(UserId)}},
                        ]
                    }
                }
            }  # query to get all jobs based on userid
            # Count number of docs present for an user
            response_count = es.count(index=index_name_jobs, body=query)
            # get all the docs for the user
            response_jobs = es.search(
                index=index_name_jobs, body=query, size=response_count['count'])
            available_jobs = [
                {"job_id": hit["_source"]["job_id"], "job_title": hit["_source"]["job_title"], "job_description": hit["_source"]["job_description"], "job_summary": hit["_source"]["job_summary"], "location": hit["_source"]["location"],
                    "min_ctc": hit["_source"]["min_ctc"], "max_ctc": hit["_source"]["max_ctc"], "max_exp": hit["_source"]["max_exp"], "valid_from": hit["_source"]["valid_from"], "valid_to": hit["_source"]["valid_to"], "min_exp": hit["_source"]["min_exp"]}
                for hit in response_jobs["hits"]["hits"]
            ]  # getting required fields for the response
            # creating dictionary of response
            total_jobs_response = {
                'Count_Jobs': response_count['count'], 'Jobs present': available_jobs}
            # return if atleast one job is present for userid
            if (response_count['count'] > 0):
                return total_jobs_response, 200
            else:
                return jsonify({"message": "No Data Found"}), 200
        else:
            return jsonify({"message": "Invalid USER.."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

host = config.get('ADD_JOBS','host')
port = config.get('ADD_JOBS','port')

if __name__ == '__main__':
    app.run(host=host,debug=False, port=port)
