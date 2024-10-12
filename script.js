import { createTable } from '/shared/utils.js';

let fileNames = [];
const referenceFile = 'reference.json';
const external = false;
const endpoint = external ? 'https://jordanx2.github.io/rwat-lab4/data/' : './data/';
const tableHeadings = ['name', 'id', 'address', 'grades'];

const populateFileNames = async (fileName, finalAppend, result = []) => {
  const res = await fetch(`${endpoint}${fileName}`);

  if(res.ok){
    const data = await res.json();

    // When there is a data location present in the response recursively fetch the next location
    if('data_location' in data) {
      const nextLocation = data.data_location;
      result.push(nextLocation);
      return await populateFileNames(nextLocation, finalAppend, result);
    }
  }

  // When the recursion is finished append the final file to the resulting array
  result.push(finalAppend);

  /*
    When using .pop() in the algorithms below, we want to ensure we get the files in reverse order i.e., data3.json, data2,json etc,
    so when we use .pop() we recursively get the files in the correct order.
  */
  return result.reverse();
}

fileNames = await (async () => await populateFileNames(referenceFile, 'data3.json'))();

// Used for processing response data, appending to resulting array and return said array
const processResponseData = (response, result) => {
  let data;
  try{
    data = JSON.parse(response).data;
  } catch(e){ data = response.data }
  data.forEach(element => {
    result.push(element);
  });

  return result;
};

const fetchXMLHttp = (resources, isAsync = false, callback, result = []) => {
  // Base case for recursion: When there is no more resources to compute upon, begin exit process of the function
  if(resources.length == 0) {
    if(isAsync && callback) {
      // When async execute callback
      callback(result);

      return;
    } 

    // Synchronously return the resulting array
    return result; 
  }
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200){
      processResponseData(xhr.response, result);

      if(isAsync) {
        // For async, recursively call without returning. Let the callback handle at the end
        fetchXMLHttp(resources, isAsync, callback, result)
      }
    }
  };
  xhr.open("GET", `${endpoint}${resources.pop()}`, isAsync);
  xhr.send();

  // For synchronous requests, recursion happens after sending, returning the result
  if(!isAsync){
    return fetchXMLHttp(resources, isAsync, callback, result)
  }
};

const fetchApi = async (resources, result = []) => {
  // Similar recursive base case, just return result array when no more resources to compute
  if(resources.length === 0){
    return result;
  }

  await fetch(`${endpoint}${resources.pop()}`)
    .then((response) => {
      if(response.ok){
        return response.json();
      }
    })
    .then((data) => {
      // Function that handles processing and appending of response data onto result array
      processResponseData(data, result);
    })
    .catch((error) => { console.log(`An error occurred: ${error.message}`) });

  return fetchApi(resources, result);
};

const removeExistingTable = () => document.querySelector('table') && document.querySelector('table').remove();      

const createButton = (label, onClick) => {
  const btn = document.createElement('button');
  btn.innerHTML = label;
  document.body.append(btn);
  btn.onclick = onClick;
};

// Spread operator used in these several instance to avoid mutating original structure
createButton('Fetch Data (Synchronous XMLHttpRequest)', () => {
  removeExistingTable();
  createTable(fetchXMLHttp([...fileNames], false), tableHeadings);
});

createButton('Fetch Data (Asynchronous XMLHttpRequest)', () => {
  fetchXMLHttp([...fileNames], true, (asyncResult) => {
    removeExistingTable();
    createTable(asyncResult, tableHeadings);
  });
});

createButton('Fetch api and promises', async () => {
  removeExistingTable();
  createTable(await fetchApi([...fileNames]), tableHeadings);
});