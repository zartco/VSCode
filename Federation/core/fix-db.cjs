const db = require('better-sqlite3')('core/federation.db');
db.prepare("UPDATE agents SET status = 'stopped'").run();
console.log("Updated statuses");
