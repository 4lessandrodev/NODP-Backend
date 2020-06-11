const FILTRO = document.getElementById('filtroPesquisa');
const INPUT_SEARCH = document.querySelector('input[type=search');
const INPUT_SEARCH_MOBILE = document.getElementById('search-mobile');
const LUPA = document.getElementById('form-pesquisar');
const LUPA_MOBILE = document.getElementById('form-pesquisar_mobile');


async function filtrar(element) {
  try {
    var query = element.dataset.item;
    if (element.classList.value != 'botao ativo') {
      if (screen.availWidth > 600) {
        location.href = `/users/pesquisas?search=pesquisar&descricao=${INPUT_SEARCH.value}&${query}`;
      } else {
        location.href = `/users/pesquisas?search=pesquisar&descricao=${INPUT_SEARCH_MOBILE.value}&${query}`;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function pesquisar() {
  event.preventDefault();
  location.href = `/users/pesquisas?search=pesquisar&descricao=${INPUT_SEARCH.value}&usuario=1&aprender=3&ensinar=4&ensinando=1&aprendendo=2`;
}
function pesquisar_mobile() {
  event.preventDefault();
  location.href = `/users/pesquisas?search=pesquisar&descricao=${INPUT_SEARCH_MOBILE.value}&usuario=1&aprender=3&ensinar=4&ensinando=1&aprendendo=2`;
}


LUPA.addEventListener('submit', pesquisar);
LUPA_MOBILE.addEventListener('submit', pesquisar_mobile);

