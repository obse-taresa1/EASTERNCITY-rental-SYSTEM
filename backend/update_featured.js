const axios = require("axios");

async function run() {
  try {
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "superadmin@example.com",
      password: "password123!"
    });
    const token = loginRes.data.accessToken;

    const featuredRes = await axios.get("http://localhost:5000/api/advertising/featured-listings/active");
    console.log("Featured:");
    console.log(JSON.stringify(featuredRes.data, null, 2));

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
