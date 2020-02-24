const visit = require('unist-util-visit')
const fetch = require('isomorphic-fetch')

const fetchCodepen = async(id) => {
	try {
		const response = await fetch(`https://cors-anywhere.herokuapp.com/https://codepen.io/api/oembed?format=json&url=https://codepen.io/jonathanharrell/pen/${id}`)
		return await response.json();
	} catch(error) {
		console.error(error)
	}
}

module.exports = ({ markdownAST }) => {
	return new Promise(async (resolve, reject) => {
		const codepenNodes = [];

		visit(markdownAST, 'jsx', async(node) => {
			if (node.value.startsWith('<Codepen')) {
				codepenNodes.push(node)
			}
		})

		for (const node of codepenNodes) {
			try {
				const re = new RegExp(/id="(\S+)"/, "g")
				const [,id] = re.exec(node.value)

				if (id) {
					const {title, thumbnail_url} = await fetchCodepen(id)
					node.value = `<Codepen id="${id}" title="${title}" thumbnailUrl="${thumbnail_url}"/>`
				}
			} catch (error) {
				console.error(error);
				return reject(error);
			}
		}

		resolve(markdownAST)
	})
}
