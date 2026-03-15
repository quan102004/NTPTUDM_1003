# NTPTUDM_1003

## MongoDB configuration

Create a `.env` file based on `.env.example`.

- Default for this project: use local MongoDB with `MONGODB_URI=mongodb://127.0.0.1:27017/ntptudm_1003`.
- MongoDB Compass should connect to the same URI: `mongodb://127.0.0.1:27017/ntptudm_1003`.
- Atlas is optional: set `DB_USERNAME`, `DB_PASSWORD`, `DB_CLUSTER`, and `DB_NAME`, or provide a full `MONGODB_URI`.

## MongoDB Compass

MongoDB Compass is a GUI client, so the app still connects by MongoDB URI as usual. To use Compass with this project:

- Install and run MongoDB Community Server locally.
- Open MongoDB Compass.
- Connect with `mongodb://127.0.0.1:27017/ntptudm_1003`.
- Start the app with `npm start`.

If you use MongoDB Atlas and still get TLS or network errors:

- Verify the Atlas cluster is running.
- Add your current IP to the Atlas Network Access allowlist.
- Check whether your network, VPN, proxy, or antivirus is blocking TLS traffic.
- If Atlas is still blocked from your machine, use a local MongoDB instance with `MONGODB_URI=mongodb://127.0.0.1:27017/ntptudm_1003` to keep developing.

Quick workarounds:

- Start without MongoDB by setting `SKIP_DB=true` in `.env`.
- Keep Atlas as primary but add `MONGODB_URI_FALLBACK=mongodb://127.0.0.1:27017/ntptudm_1003` to auto-fallback to local MongoDB.

## TLS diagnosis note

This project was tested with a direct Node.js TLS probe to the Atlas shard host, and the same TLS alert happened before MongoDB authentication. That means this specific error is usually outside the Express codebase and is more likely caused by Atlas network policy, local firewall/VPN/proxy, or machine-specific TLS interception.
