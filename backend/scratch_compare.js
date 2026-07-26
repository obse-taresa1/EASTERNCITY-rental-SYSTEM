const bcrypt = require('bcryptjs');
const hash = "$2b$10$1R6Ng7n7ON0sTjOwN9byVOoBV4TtidE4miJjZF4ZSnGqFQibVWVCu";
bcrypt.compare("password123", hash).then(res => console.log("Match:", res));
