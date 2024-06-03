// {
//     nome: ''
//     autor: ''
//     genero: ''
//     anoPublicacao: ''
//     personagens: [personagem1, 2, 3, 4]
// }

import http from 'node:http'
import fs from 'node:fs'

const PORT = 3333

const server = http.createServer((resquest, response) => {
    const { method, url } = resquest

    if (method === 'GET' && url === '/livros') {
        fs.readFile('livros.json', 'utf-8', (err, data) => {
            if (err) {
                response.writeHead(500, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: "Não ler o arquivo" }));
                return;
            }
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(data);
        })
    } else if (method === 'POST' && url === '/livros') {
        let body = '';
        resquest.on("data", (chunk) => {
            body += chunk;
        });
        resquest.on('end', () => {
            const novoLivro = JSON.parse(body)
            fs.readFile("livros.json", "utf-8", (err, data) => {
                if (err) {
                    response.writeHead(500, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: "Não foi possível acessar os dados" }));
                    return
                }
                const livros = JSON.parse(data)
                novoLivro.id = livros.length + 1
                livros.push(novoLivro)

                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err) => {
                    if(err){
                        response.writeHead(500, {'Content-Type': 'application/json'})
                        response.end(JSON.stringify({ message: 'Arquivo não encontrado'}))
                        return
                    }
                    response.writeHead(201, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify(novoLivro))
                })
                console.log(livros)
                return response.end()
            })
        });

        // console.log('novoLivro: ', novoLivro)
        // console.log('livros:', data)
        // console.log(typeof livros)
    }else if(method === 'PUT' && url.startsWith('/livros/')){
        //1º receber dados da URL /localhost/{id}

        const id = parseInt(url.split('/')[2])

        let body = ""
        resquest.on("data", (chunk) => {
            body += chunk
        })
        resquest.on('end', () => {
            const livroAtualizado = JSON.parse(body)
            fs.readFile('livros.json', 'utf-8', (err, data) => {
                if(err){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Não foi possível ler o arquivo'}))
                return
                }
                const livros = JSON.parse(data)

                const indexLivro = livros.findIndex((livro) => livro.id === id)
                if(indexLivro === -1){
                    response.writeHead(400, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({ message: 'Livro não encontrado'}))
                    return
                }
                
                livros[indexLivro] = {...livros[indexLivro], ...livroAtualizado}

                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err) => {
                    if(err){
                    response.writeHead(500, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({ message: 'Arquivo não encontrado'}))
                    return
                    }
                    response.writeHead(200, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify(livroAtualizado))
                })
            })
        })
    }else if(method === 'DELETE' && url.startsWith('/livros/')){
        //Receber um valor na URL /localhost/{id}
        const id = parseInt(url.split('/')[2])
        fs.readFile('livros.json', 'utf-8', (err, data) => {
            if(err){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Não é possível acessar o arquivo'}))
                return
            }
            const livros = JSON.parse(data)
            const indexLivro = livros.findIndex((livros) => livros.id === id)
            // findIndex -> se ele não encontrar um index do objeto ele retorna -1
            // console.log(indexLivro) // V - indice que elemento está | F -> -1
            if(indexLivro === -1){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Livro não encontrado'}))
                return
            }
            livros.splice(indexLivro, 1)
            fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err) =>{
                if(err){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Não é possível escrever no arquivo'}))
                return
                }
            })
            response.writeHead(200, ({"Content-Type": "application/json"}))
            response.end(JSON.stringify({message: "Livro excluído"}))
        })
    }else if(method === 'GET' && url.startsWith('/livros/')){
        const id = parseInt(url.split('/')[2])
        console.log(id)
        fs.readFile('livros.json', 'utf8', (err,data) => {
            if(err){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Erro ao pesquisar no arquivo'}))
                return
            }
            const livros = JSON.parse(data)
            const encontrarLivro = livros.find((livro)=> livro.id === id)
            if(!encontrarLivro){
                response.writeHead(404, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: 'Livro não encontrado'}))
                return
            }   
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.end(JSON.stringify(encontrarLivro))
        })
    } else {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Página não encontrada" }));
    }
});

server.listen(PORT, () => {
    console.log(`Sevidor on http://localhost:${PORT}`)
});