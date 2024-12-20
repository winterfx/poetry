import os
import openai
import requests
import tiktoken
from dotenv import load_dotenv
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, Settings, GPTVectorStoreIndex
from llama_index.llms.openai import OpenAI
# from llama_index.vector_stores.pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import json

# Load the environment variables
load_dotenv()
api_key = os.getenv("API_Endpoint_API_KEY_PROD")
if api_key is None:
    raise ValueError("Can't get AI Endpoint token which generated from RDSec One Portal")

base_url = os.getenv("BASE_URL")
if base_url is None:
    raise ValueError("Can't get base URL which generated from RDSec One Portal")

vectory_store_key=os.getenv("VECTOR_STORE_KEY")
index_name=os.getenv("INDEX")

sys_prompt = '''你是一位深谙中国古典诗词的文学大师，精通唐诗宋词的意境、情感和艺术特色。

请根据用户的描述，从以下维度分析并推荐最合适的3首诗词：
1. 意境契合：诗词的意境与用户描述的场景或心境的吻合度
2. 情感共鸣：诗词所表达的情感与用户当下心情的共鸣程度
3. 艺术价值：诗词在意象运用、语言技巧等方面的艺术成就
4. 历史影响：诗词的传播度和历史评价

为确保推荐的多样性：
- 尽量选择不同朝代、不同作者的作品
- 优先选择与用户描述高度相关的经典名作
- 确保诗词内容的完整性和准确性

请以下面的JSON格式返回结果（不要带有```json标记）：
{
    "poems": [
        {
            "title": "诗词标题",
            "author": "作者",
            "dynasty": "朝代",
            "content": "完整的诗词内容（包含标点符号）"
        },
        {
            "title": "诗词标题",
            "author": "作者",
            "dynasty": "朝代",
            "content": "完整的诗词内容（包含标点符号）"
        },
        {
            "title": "诗词标题",
            "author": "作者",
            "dynasty": "朝代",
            "content": "完整的诗词内容（包含标点符号）"
        }
    ]
}
'''

# Set the base URL and api_key for the RDSec One AI Endpoint API
openai.base_url = base_url
openai.api_key = api_key
openai.api_type = "openai"
model = "gpt-4o"

# Initialize Pinecone
pc = Pinecone(api_key=vectory_store_key)



# Set the LLM model
Settings.llm = OpenAI(model=model, temperature=0.7)

def parseResponse(response):
    json_response = json.loads(response)
    poems = []
    for poem in json_response.get("poems", []):
        title = poem["title"]
        author = poem["author"]
        dynasty = poem["dynasty"]
        content = poem["content"]
        poems.append({
                "title": title,
                "author": author,
                "dynasty": dynasty,
                "content": content
        })
    return {"poems": poems}

def askAI(input,local=False):
    user_prompt = input
    res=generateAnswer(sys_prompt,user_prompt,local)
    # parse the response to json format
    print("====================")
    print(res)

    parsed_response = parseResponse(res)
    print(parsed_response)
    return parsed_response

def generateAnswer(sys_prompt,user_prompt,local=False):
    if local:
        index=getVectorStore()
        query_engine = index.as_query_engine()
        prompt=sys_prompt+user_prompt
        response = query_engine.query(prompt)
        
        # Get the encoding for the model and calculate the token usage
        encoding = tiktoken.encoding_for_model(model)
        input_tokens = encoding.encode(prompt)
        output_tokens = encoding.encode(response.__str__())
        print(f"Response:\n{response} \n")
        print(f"Token Usage: \ncompletion_tokens:{len(output_tokens)} | prompt_token:{len(input_tokens)} | total_tokens:{len(input_tokens) + len(output_tokens)}\n")
        return response.__str__()
    else :
        print(sys_prompt)
        print(user_prompt)
        response = generateAnswerByGPT(sys_prompt, user_prompt, model)
        return response
    
# def generateAnswerByRAG(prompt):
#     index=getVectorStore()
#     query_engine = index.as_query_engine()
#     response = query_engine.query(prompt)
        
#     # Get the encoding for the model and calculate the token usage
#     encoding = tiktoken.encoding_for_model(model)
#     input_tokens = encoding.encode(prompt)
#     output_tokens = encoding.encode(response.__str__())
#     print(f"Response:\n{response} \n")
#     print(f"Token Usage: \ncompletion_tokens:{len(output_tokens)} | prompt_token:{len(input_tokens)} | total_tokens:{len(input_tokens) + len(output_tokens)}\n")
#     return response.__str__()

def generateAnswerByGPT(system_prompt, user_prompt, model)->str:
    """
    This function is used to query the AI endpoint with a given system prompt and user prompt.

    Parameters:
    system_prompt (str): The system prompt that guides the model's behavior.
    user_prompt (str): The user prompt that will be sent to the AI endpoint.
    model (str): The model to be used for the query.

    Returns:
    dict: The response from the AI endpoint in JSON format if the status code is 200, else None.
    """
    headers = {"Authorization": api_key, "Content-Type": "application/json"}
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_prompt)}
        ],
        "temperature": 0.5,
        "top_p": 1,
        "max_tokens": 1024,
        "stream": True
    }
    try:
        response = requests.post(base_url+"chat/completions", headers=headers, json=data, stream=True)
        response.raise_for_status()  # Raise an error for bad status codes

        complete_response = ""
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data: "):
                    # Remove the "data: " prefix
                    json_data = decoded_line[6:]
                    data = json.loads(json_data)

                    delta = data['choices'][0].get('delta', {})
                    if 'content' in delta:
                        delta_content = delta['content']
                        complete_response += delta_content
                    
                    if 'finish_reason' in data['choices'][0]:
                        finish = data['choices'][0]['finish_reason']
                        if finish == "stop":
                            break
                    

        return complete_response
    except requests.exceptions.RequestException as e:
        print(f"Error querying model {model}: {e}")
        return None

    
def createVectorStore(data_folder):
    documents = SimpleDirectoryReader(data_folder).load_data()
    vector_store = PineconeVectorStore(pinecone_index=pc.Index(index_name))
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    GPTVectorStoreIndex.from_documents(documents, storage_context=storage_context)

def updateVectorStore(data_folder):
    documents = SimpleDirectoryReader(data_folder).load_data()
    vector_store = PineconeVectorStore(pinecone_index=pc.Index(index_name))
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    GPTVectorStoreIndex.insert(documents, storage_context=storage_context)
   
def getVectorStore():
    vector_store = PineconeVectorStore(pinecone_index=pc.Index(index_name))
    return GPTVectorStoreIndex.from_vector_store(vector_store)



def getPoemsDescription(poem):
    sys_prompt = '''你是一个诗词大师，熟悉中国古代的唐诗宋词。
    请根据提供的诗词。将这首诗用现代语言大概解释诗词内容以及包含的情感。为了简洁，请不要再次提供诗词内容。
    '''
    return generateAnswerByGPT(sys_prompt, user_prompt=poem, model=model)



# if __name__ == "__main__":
#     response = getPoemsDescription({'title': '夜泊牛渚怀古', 'author': '李白', 'content': '牛渚西江夜，青天无片云。登舟望秋月，空忆谢将军。余亦能高咏，斯人共长云。'})
#     print(response)