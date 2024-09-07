//use env to mask the keys
const validApiKeys = [process.env.API_KEY_1,process.env.API_KEY_2,process.env.API_KEY_3,process.env.API_KEY_4,process.env.API_KEY_5];

const verifyApiKey = (req,res,next) =>{
    const apiKey = req.headers['x-api-key'];
    //not valud api key
    if(!apiKey|| !validApiKeys.includes(apiKey)){
        return res.status(403).json({message: 'Forbidden: Invalid API Key'});
    }
    //valid api we proceed
    next();
};

module.exports =verifyApiKey;