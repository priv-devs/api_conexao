CREATE TABLE auth (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    id_user INTEGER, 
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_user)
);
