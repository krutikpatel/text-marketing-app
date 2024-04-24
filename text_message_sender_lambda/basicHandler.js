/*
export const handlerold = async (event) => {
    // TODO implement
    console.log('krutik event = '+ JSON.stringify(event));
    //for (const message of event.Records) {
    const message = event.Records[0];
    console.log(`krutik Processed message ${message.body}`);
    
    const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
  };
  */
  /*
  export const handler = async (event, context) => {
    for (const message of event.Records) {
      await processMessageAsync(message);
    }
    console.info("done");
  };
  
  async function processMessageAsync(message) {
    try {
      console.log(`Processed message ${message.body}`);
      // TODO: Do interesting work based on the new message
      await Promise.resolve(1); //Placeholder for actual async work
    } catch (err) {
      console.error("An error occurred");
      throw err;
    }
  }
  */