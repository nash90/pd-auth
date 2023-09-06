# Solana-JWT-Auth Plugin

This plugin provides a convenient way to integrate JWT based login function for solana wallet based app with frontend api client and backend functionality into your Next.js application. To use this plugin, follow the instructions below.

## Dependencies
Add/Install following node dependencies if not already
```
    "@solana-mobile/wallet-adapter-mobile": "^2.0.0",
    "@solana/wallet-adapter-base": "^0.9.22",
    "@solana/wallet-adapter-react": "^0.15.32",
    "@solana/wallet-adapter-react-ui": "^0.9.31",
    "@solana/wallet-adapter-wallets": "^0.19.16",
    "@solana/web3.js": "^1.60.0",
    "next": "12.2.0",
    "react": "^18.2.0",
```

## Adding Backend Routes

To add backend functionality to your Next.js app, follow these steps:

1. Create a new file in the `pages/api` directory with the desired route path. For example, to create a route at `/api/my-backend-route`, create a file named `my-backend-route.js` or `my-backend-route.ts`.

2. Use the following format for your backend route file:

   ```javascript
   import { NextApiRequest, NextApiResponse } from "next";
   import { errorHandler } from "path/to/errorHandler"; // Update with your error handler import
   import { myBackendHandler } from "path/to/myBackendHandler"; // Update with your backend handler import

   export default async function apiHandler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     try {
       await myBackendHandler(req, res); // Call your backend handler function
     } catch (error) {
       errorHandler(error, res); // Handle errors with your error handler
     }
   }

Replace "path/to/errorHandler" and "path/to/myBackendHandler" with the actual paths to your error handler and backend handler files. 
Make sure to implement your own error handling and backend logic within myBackendHandler.


## Adding Frontend Routes
To add frontend routes to your Next.js app, follow these steps:

1. Create a new file in the pages directory with the desired route path. For example, to create a route at /my-frontend-page, create a file named my-frontend-page.js or my-frontend-page.ts.

2. Use the following format for your frontend route file:

```javascript
import type { NextPage } from "next";
import { HeadTagMeta } from "path/to/HeadTagMeta"; // Update with your meta import
import MyComponent from "path/to/MyComponent"; // Update with your component import

const MyNextPage: NextPage = () => {
  const meta: HeadTagMeta = {
    title: "Page Title", // Update with your page title
  };

  return (
    <MyComponent meta={meta} /> // Replace with your component
  );
};

export default MyNextPage;
```

Replace "path/to/HeadTagMeta" with the actual path to your meta import, and "path/to/MyComponent" with the actual path to your component import. 
Make sure to update the title and component used in the route file to match your specific frontend
