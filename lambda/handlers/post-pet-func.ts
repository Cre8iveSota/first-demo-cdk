exports.handler = async (event: any) => {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
    // Validate the request body
    if (!requestBody.type || !requestBody.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request. 'type' and 'price' are required fields.",
        }),
      };
    }
  
    // Create a new pet object (in a real scenario, this might involve database operations)
    const newPet = {
      id: Math.floor(Math.random() * 1000),  // Generate a random ID for the pet
      type: requestBody.type,
      price: requestBody.price,
    };
  
    // Response to be returned
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Pet created successfully",
        pet: newPet,
      }),
    };
  
    return response;
  };
  