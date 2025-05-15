import { useState } from 'react';
import './App.css';

const PREDEFINED_JSON = {
    "companyAddresses": [
      {
        "action": "ADD",
        "data": {
          "addressLine1": "test",
          "city": "pricent",
          "country": "China",
          "state": "test",
          "type": "COMPANY_ADDRESS",
          "zipCode": "1233333"
        }
      }
    ],
    "shareholders": [
      {
        "action": "ADD",
        "data": {
          "address": {
            "addressLine1": "testAddress1",
            "city": "privent",
            "state": "Lagos State",
            "country": "China",
            "type": "HOME_ADDRESS",
            "zipCode": "200000"
          },
          "dateOfBirth": "2007-05-01",
          "firstName": "testname",
          "lastName": "name",
          "nationality": "China",
          "ownerType": "INDIVIDUAL"
        }
      }
    ]
}

function App() {
  const [userInputJson, setUserInputJson] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  // Sample data for autofill
  const correctSampleJson = {
    companyAddresses: [
      {
        action: "ADD",
        data: {
          addressLine1: "123 Main St",
          city: "Anytown",
          country: "USA",
          state: "CA",
          type: "COMPANY_ADDRESS",
          zipCode: "90210"
        }
      }
    ],
    shareholders: [
      {
        action: "ADD",
        data: {
          address: {
            addressLine1: "456 Oak Ave",
            city: "Otherville",
            state: "NY",
            country: "USA",
            type: "HOME_ADDRESS",
            zipCode: "10001"
          },
          dateOfBirth: "1990-01-15",
          firstName: "John",
          lastName: "Doe",
          nationality: "USA",
          ownerType: "INDIVIDUAL"
        }
      }
    ]
  };

  const incorrectSampleJson = {
    companyAddresses: [
      {
        action: "UPDATE", // Different action
        data: {
          // addressLine1 is missing
          city: "Lostville",
          country: "Canada",
          state: "BC",
          type: "BRANCH_OFFICE", // Different type
          zipCode: "V6C1G5"
        }
      }
    ],
    shareholders: [
      {
        action: "ADD",
        data: {
          address: {
            addressLine1: "789 Pine Rd",
            // city is missing
            state: "FL",
            country: "USA",
            type: "SECONDARY_ADDRESS", // Different type
            zipCode: "33101"
          },
          // dateOfBirth is missing
          firstName: "Jane",
          // lastName is missing
          nationality: "UK"
          // ownerType is missing
        }
      }
    ]
  };

  const handleAutofill = (sampleData) => {
    setUserInputJson(JSON.stringify(sampleData, null, 2));
    setComparisonResult(null);
    setError(null);
  };

  const getMissingFields = (obj, predefined, path = '') => {
    let missing = [];

    for (const key in predefined) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!obj.hasOwnProperty(key)) {
        missing.push(currentPath);
        continue;
      }

      if (Array.isArray(predefined[key])) {
        if (!Array.isArray(obj[key])) {
          missing.push(`${currentPath} (expected an array, but found ${typeof obj[key]})`);
          continue;
        }

        if (predefined[key].length > 0 && typeof predefined[key][0] === 'object' && predefined[key][0] !== null) {
          const predefinedItemStructure = predefined[key][0];
          if (obj[key].length === 0 && Object.keys(predefinedItemStructure).length > 0) {
            missing.push(`${currentPath}[0] (array is empty, but expected items with structure)`);
          } else {
            obj[key].forEach((item, index) => {
              if (typeof item !== 'object' || item === null) {
                missing.push(`${currentPath}[${index}] (expected an object within array, but found ${typeof item})`);
              } else {
                const arrayItemPath = `${currentPath}[${index}]`;
                const nestedMissing = getMissingFields(item, predefinedItemStructure, arrayItemPath);
                missing = missing.concat(nestedMissing);
              }
            });
          }
        }
      } else if (typeof predefined[key] === 'object' && predefined[key] !== null) {
        if (typeof obj[key] !== 'object' || obj[key] === null) {
          missing.push(`${currentPath} (expected an object, but found ${typeof obj[key]})`);
          continue;
        }
        const nestedMissing = getMissingFields(obj[key], predefined[key], currentPath);
        missing = missing.concat(nestedMissing);
      } else {
        // Primitive types: presence is checked by obj.hasOwnProperty(key) above.
        // Type checking for primitives can be added here if necessary.
      }
    }
    return missing;
  };

  const handleCompare = () => {
    setError(null);
    setComparisonResult(null);
    if (!userInputJson.trim()) {
      setError({ message: 'Please enter JSON to compare.' });
      return;
    }

    let parsedUserJson;
    try {
      parsedUserJson = JSON.parse(userInputJson);
    } catch (e) {
      let lineNum = null;
      let lineText = null;
      const lineMatch = e.message.match(/line (\d+)/);
      if (lineMatch && lineMatch[1]) {
        lineNum = parseInt(lineMatch[1], 10);
        const lines = userInputJson.split('\n');
        if (lineNum > 0 && lineNum <= lines.length) {
          lineText = lines[lineNum - 1];
        }
      }
      setError({ message: 'Invalid JSON input: ' + e.message, lineNum, lineText });
      return;
    }

    const missingFields = getMissingFields(parsedUserJson, PREDEFINED_JSON);

    if (missingFields.length === 0) {
      setComparisonResult({ match: true });
    } else {
      setComparisonResult({ match: false, missingFields });
    }
  };

  return (
    <div className="App">
      <h1>JSON Field Comparator</h1>
      
      <div className="container">
        <div className="json-section">
          <h2>Predefined JSON Structure</h2>
          <pre>{JSON.stringify(PREDEFINED_JSON, null, 2)}</pre>
        </div>

        <div className="json-section">
          <h2>Your JSON Input</h2>
          <textarea
            rows="15"
            cols="50"
            value={userInputJson}
            onChange={(e) => setUserInputJson(e.target.value)}
            placeholder='Enter your JSON here...'
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleAutofill(correctSampleJson)} 
              style={{ flex: 1, backgroundColor: '#6c757d', color: 'white' }} // Secondary button style
            >
              Autofill Correct
            </button>
            <button 
              onClick={() => handleAutofill(incorrectSampleJson)} 
              style={{ flex: 1, backgroundColor: '#6c757d', color: 'white' }} // Secondary button style
            >
              Autofill Incorrect
            </button>
          </div>
          <button 
            onClick={handleCompare} 
            style={{ marginTop: '10px', width: '100%' }} // Full width
          >
            Compare JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="result error-message">
          <h3>Error:</h3>
          <p>{error.message}</p>
          {error.lineNum && error.lineText && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ marginBottom: '5px' }}>Problematic line ({error.lineNum}):</p>
              <pre style={{ backgroundColor: '#ffe5e5', padding: '5px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                <code>{error.lineText}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {comparisonResult && (
        <div className="result">
          <h3>Comparison Result:</h3>
          {comparisonResult.match ? (
            <p style={{ color: 'green' }}>All fields match the predefined structure!</p>
          ) : (
            <>
              <p style={{ color: 'red' }}>Mismatch found. Missing fields:</p>
              <ul>
                {comparisonResult.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
