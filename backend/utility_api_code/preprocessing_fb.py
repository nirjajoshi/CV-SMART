import os
import fitz
import re
import sys
import base64
import tempfile
import configparser
from io import BytesIO
from docxpy import process
from builtins import str
from past.builtins import basestring
from itertools import zip_longest
import aspose.words as aw
import docxpy
if sys.version_info[0] >= 3:
    unicode = str

config = configparser.ConfigParser()
config.read('config.ini')

class Preprocessing():
    def __init__(self,doctype,filename,document):
        self.doctype = doctype
        self.filename = filename
        self.document = document


    def decode_base64_to_doc(self,base64_content, doc_file_path):
        decoded_content = base64.b64decode(base64_content)        
        with open(doc_file_path, "wb") as file:
            file.write(decoded_content)


    def convert_doc_to_docx(self,doc_file_path, docx_file_path):
        doc = aw.Document(doc_file_path)
        doc.save(docx_file_path)
        
    def check_filetype_process(self):
        processed_text = ''
        _, file_extension = os.path.splitext(self.filename)
        if file_extension.lower() =='.pdf':
            processed_text = self.pdf_extraction(self.document)
            return processed_text
        elif file_extension.lower() =='.docx':
            processed_text = self.docx_extraction(self.document)
            return processed_text
        elif file_extension.lower()=='.doc':
            processed_text = self.doc_extraction(self.document)
            return processed_text
        else:
            return processed_text
            

    def pdf_extraction(self,document):
        '''Send the base64 here and save the pdf in the resume_file folder'''
        try:
            pdf_bytes = base64.b64decode(self.document)
            filename_pdf = self.filename
            path_pdf = config.get('PATH','resume_file')
            path_pdf_base64 = os.path.join(path_pdf,filename_pdf)
           
            with open(path_pdf_base64,'wb') as f:
                f.write(pdf_bytes)

            resume_list = os.listdir(path_pdf)
            for i in resume_list:  
                doc = fitz.open(path_pdf+'/'+i) # open a document
                total_text = ""
                for page in doc: # iterate the document pages
                    text = page.get_text().encode("utf-8") # get plain text (is in UTF-8)
                    text_decoded = text.decode("utf-8")
                    total_text += text_decoded
                    total_text = re.sub(r'(\n\s*)+\n+', '\n\n',total_text)
                    total_text = total_text.encode("ascii", "ignore").decode()
                    total_text = re.sub(r'\n\s*\n', '\n\n', total_text)
                    final_text = ''.join([line.strip()+'\n' for line in total_text.splitlines()])
                    # final_text = self.print_temp(final_text,resume_name = i.split(".")[0])
            return final_text
        except Exception as e:
            print(str(e))
            raise
        finally:
            if os.path.exists(path_pdf_base64):
                os.remove(path_pdf_base64)
    
    
    def docx_extraction(self,document):
        try:
            binary_content = base64.b64decode(self.document)
            docx_bytes = BytesIO(binary_content)
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(binary_content)
            text = process(temp_file.name)
            temp_file.close()
            total_text = re.sub(r'(\n\s*)+\n+', '\n\n',text)
            total_text = total_text.encode("ascii", "ignore").decode()
            total_text = re.sub(r'\n\s*\n', '\n\n', text)
            final_text = ''.join([line.strip()+'\n' for line in text.splitlines()])
            return final_text
        except Exception as e:
            print(str(e))
            raise

    def doc_extraction(self,document):
        try:
            root_path = config.get('PATH','conversion_doc_docx')
            pth_doc = os.path.join(root_path,'t1_.doc')
            pth_docx = os.path.join(root_path,'t2_.docx')
            self.decode_base64_to_doc(document,pth_doc)
            self.convert_doc_to_docx(pth_doc, pth_docx)
            text = docxpy.process(pth_docx)
            for i in [pth_doc, pth_docx]:
                os.remove(i)
            return text[80:-139]
        except Exception as ex:
            print(ex)
            print('Not Able to process Doc')



    def combine_company_desgination(self,companies_work,designation):
        #zip_longest function to handle the case of one list is shorter than another to combine those 2 list
        result = [{'Company': company, 'Designation': designation} for company, designation in zip_longest(companies_work, designation, fillvalue='')] 
        return result    

    def combine_education_details(self,education,college,marks,passing_year):
        #zip_longest function to handle the case of one list is shorter than another to combine those 2 list
        result = [{'Education': education_, 'Institute': college_, 'Marks' : marks_,'Duration' : passing_year_} for education_, college_,marks_,passing_year_ in zip_longest(education, college,marks,passing_year, fillvalue='')] 
        return result
    
    
    def check_for_firstname_lastname(self,resume_details):
        key = 'NAME'
        if key in resume_details:
            parts = resume_details['NAME'][0].split()
            if len(parts) == 2:
                # Case 2: jatin patil
                first_name = parts[0]
                last_name = parts[1]
                middle_name = ""
            else:
                # Case 1: jatin k patil
                first_name = parts[0]
                middle_name = parts[1]
                last_name = parts[2]
            return first_name, middle_name , last_name          
        else:
            first_name = ''
            middle_name = ''
            last_name = ''
            return first_name, middle_name , last_name