const fs = require('fs');
const path = require('path');
const pool = require(path.join(__dirname, '..', 'src', 'database'));

const DATABASE_SQL_DIR = __dirname;

function resolveSqlPath(filename) {
    const base = path.basename(filename);
    const resolved = path.resolve(DATABASE_SQL_DIR, base);
    const relative = path.relative(path.resolve(DATABASE_SQL_DIR), resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('Caminho de SQL inválido');
    }
    return resolved;
}

/**
 * Lê um arquivo .sql desta pasta (`database/`) e executa com o pool de `src/database`.
 * @param {string} filename - Nome do arquivo (ex.: "tipo_usuario.sql").
 * @returns {Promise<void>}
 */
async function executeSqlFile(filename) {
    const filePath = resolveSqlPath(filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await pool.connect();
    try {
        await client.query(sql);
    } finally {
        client.release();
    }
}

/**
 * Executa todos os `.sql` desta pasta, em ordem alfabética (prefixos 001_, 002_ ajudam na ordem).
 * @returns {Promise<void>}
 */
async function executeAllSqlFiles() {
    if (!fs.existsSync(DATABASE_SQL_DIR)) {
        throw new Error(`Pasta não encontrada: ${DATABASE_SQL_DIR}`);
    }
    const files = fs
        .readdirSync(DATABASE_SQL_DIR)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    for (const file of files) {
        await executeSqlFile(file);
    }
}

module.exports = {
    executeSqlFile,
    executeAllSqlFiles,
    DATABASE_SQL_DIR,
};

if (require.main === module) {
    executeAllSqlFiles()
        .then(() => {
            console.log('Migrations executadas com sucesso.');
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
