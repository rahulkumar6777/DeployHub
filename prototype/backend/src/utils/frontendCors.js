const corsLocally = {
    origin: ['http://localhost:5173'],
    methods: ['POST' , 'GET' , 'PUT' , 'DELETE' , 'OPTIONS' , 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

const corsProdution = {
    origin: ['https://dashboard.deployhub.cloud'],
    methods: ['POST' , 'GET' , 'PUT' , 'DELETE' , 'OPTIONS' , 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

export const corsOption  = process.env.NODE_ENV === 'production' ? corsProdution : corsLocally;