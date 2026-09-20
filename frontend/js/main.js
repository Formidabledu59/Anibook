const isLocalStaticServer =
    window.location.protocol === 'file:' ||
    window.location.port === '5500' ||
    window.location.port === '5501';

const API_URL = isLocalStaticServer
    ? 'http://localhost:3000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('characters-grid')) {
        initializeCharactersPage();
    }

    if (document.getElementById('characters-count')) {
        loadHomeStatistics();
    }

    if (document.getElementById('random-button')) {
        initializeRandomPage();
    }

    if (document.getElementById('character-detail')) {
        initializeCharacterDetailPage();
    }

    if (document.getElementById('who-board')) {
        initializeWhoGamePage();
    }

    if (document.getElementById('character-form')) {
        initializeAdminPage();
    }
});

/*
 * ============================================================
 * ACCUEIL
 * ============================================================
 */

async function loadHomeStatistics() {
    const charactersCount =
        document.getElementById('characters-count');

    const universesCount =
        document.getElementById('universes-count');

    const apiStatus =
        document.getElementById('api-status');

    const apiUptime =
        document.getElementById('api-uptime');

    try {
        const [
            charactersResponse,
            universesResponse,
            healthResponse
        ] = await Promise.all([
            fetch(`${API_URL}/characters`),
            fetch(`${API_URL}/universes`),
            fetch(`${API_URL}/health`)
        ]);

        if (!charactersResponse.ok) {
            throw new Error(
                'Impossible de récupérer les personnages.'
            );
        }

        if (!universesResponse.ok) {
            throw new Error(
                'Impossible de récupérer les univers.'
            );
        }

        if (!healthResponse.ok) {
            throw new Error(
                'Impossible de vérifier l API.'
            );
        }

        const charactersData =
            await charactersResponse.json();

        const universesData =
            await universesResponse.json();

        const health =
            await healthResponse.json();

        charactersCount.textContent =
            charactersData.characters.length;

        universesCount.textContent =
            universesData.universes.length;

        if (health.status === 'OK') {
            apiStatus.textContent =
                '● API opérationnelle';

            apiUptime.textContent = 'OK';
        } else {
            apiStatus.textContent =
                '● API indisponible';

            apiUptime.textContent = 'OFF';
        }

    } catch (error) {
        console.error(
            'Erreur lors du chargement des statistiques :',
            error
        );

        charactersCount.textContent = '—';
        universesCount.textContent = '—';

        apiStatus.textContent =
            '● API indisponible';

        apiUptime.textContent = 'OFF';
    }
}


/*
 * ============================================================
 * PERSONNAGES
 * ============================================================
 */

let characters = [];
let universes = [];
let characterTags = [];

let currentSearch = '';
let currentUniverse = '';
let currentTag = '';
let characterSearchTimer = null;
let characterRequestController = null;


async function initializeCharactersPage() {
    const loading =
        document.getElementById('characters-loading');

    try {
        const [
            universesResponse,
            tagsResponse
        ] = await Promise.all([
            fetch(`${API_URL}/universes`),
            fetch(`${API_URL}/tags`)
        ]);

        if (!universesResponse.ok) {
            throw new Error(
                'Impossible de récupérer les univers.'
            );
        }

        if (!tagsResponse.ok) {
            throw new Error(
                'Impossible de récupérer les tags.'
            );
        }

        const universesData =
            await universesResponse.json();

        const tagsData =
            await tagsResponse.json();

        universes = Array.isArray(universesData)
            ? universesData
            : universesData.universes || [];

        characterTags = Array.isArray(tagsData)
            ? tagsData
            : tagsData.tags || [];

        populateUniverseFilter();
        populateTagFilter();

        setupCharacterFilters();

        await loadCharacters();

    } catch (error) {
        console.error(
            'Erreur lors du chargement des personnages :',
            error
        );

        loading.textContent =
            'Impossible de charger les personnages.';

        loading.hidden = false;

        document.getElementById(
            'characters-empty'
        ).hidden = true;

        document.getElementById(
            'characters-grid'
        ).innerHTML = '';
    }
}


/*
 * ============================================================
 * FILTRE UNIVERS
 * ============================================================
 */

function populateUniverseFilter() {
    const select =
        document.getElementById('universe-filter');

    universes.forEach((universe) => {
        const option =
            document.createElement('option');

        option.value = universe.id;
        option.textContent = universe.name;

        select.appendChild(option);
    });
}


function populateTagFilter() {
    const select =
        document.getElementById('tag-filter');

    characterTags.forEach((tag) => {
        const option = document.createElement('option');

        option.value = tag.id;
        option.textContent = tag.name;

        select.appendChild(option);
    });
}


/*
 * ============================================================
 * FILTRES
 * ============================================================
 */

function setupCharacterFilters() {
    const searchInput =
        document.getElementById('character-search');

    const universeFilter =
        document.getElementById('universe-filter');

    const tagFilter =
        document.getElementById('tag-filter');

    const resetButton =
        document.getElementById('filter-reset');

    searchInput.addEventListener(
        'input',
        (event) => {
            currentSearch =
                event.target.value
                    .trim()
                    .toLowerCase();

            clearTimeout(characterSearchTimer);

            characterSearchTimer = setTimeout(
                loadCharacters,
                250
            );
        }
    );

    universeFilter.addEventListener(
        'change',
        (event) => {
            currentUniverse =
                event.target.value;

            loadCharacters();
        }
    );

    tagFilter.addEventListener(
        'change',
        (event) => {
            currentTag = event.target.value;

            loadCharacters();
        }
    );

    resetButton.addEventListener(
        'click',
        () => {
            currentSearch = '';
            currentUniverse = '';
            currentTag = '';

            searchInput.value = '';
            universeFilter.value = '';
            tagFilter.value = '';

            loadCharacters();
        }
    );
}


/*
 * ============================================================
 * FILTRAGE
 * ============================================================
 */

function getFilteredCharacters() {
    return characters;
}


/*
 * ============================================================
 * AFFICHAGE
 * ============================================================
 */

function renderCharacters() {
    const grid =
        document.getElementById('characters-grid');

    const loading =
        document.getElementById('characters-loading');

    const empty =
        document.getElementById('characters-empty');

    const filteredCharacters =
        getFilteredCharacters();

    loading.hidden = true;
    empty.hidden = true;

    grid.innerHTML = '';

    if (filteredCharacters.length === 0) {
        empty.hidden = false;
        return;
    }

    filteredCharacters.forEach((character) => {
        grid.appendChild(
            createCharacterCard(character)
        );
    });
}


/*
 * ============================================================
 * CARTE PERSONNAGE
 * ============================================================
 */

function createCharacterCard(character) {
    const article =
        document.createElement('article');

    article.className =
        'character-card';

    article.tabIndex = 0;
    article.setAttribute(
        'aria-label',
        `Voir la fiche de ${character.name}`
    );

    article.addEventListener(
        'click',
        () => {
            window.location.href =
                `character.html?id=${character.id}`;
        }
    );

    article.addEventListener(
        'keydown',
        (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                article.click();
            }
        }
    );

    const imageContainer =
        document.createElement('div');

    imageContainer.className =
        'character-image';

    const image =
        document.createElement('img');

    image.src =
        character.illustration ||
        character.icon ||
        'https://placehold.co/600x800?text=Anibook';

    image.alt =
        character.name;

    image.loading = 'lazy';

    imageContainer.appendChild(image);

    const info =
        document.createElement('div');

    info.className =
        'character-info';

    const name =
        document.createElement('h2');

    name.className =
        'character-name';

    name.textContent =
        character.name;

    const description =
        document.createElement('p');

    description.className =
        'character-description';

    description.textContent =
        character.description ||
        'Aucune description disponible.';

    const tagsContainer =
        document.createElement('div');

    tagsContainer.className =
        'tags';

    const universe =
        universes.find(
            (item) =>
                item.id === character.universe_id
        );

    if (universe) {
        const universeTag =
            document.createElement('span');

        universeTag.className =
            'tag';

        universeTag.textContent =
            universe.name;

        tagsContainer.appendChild(
            universeTag
        );
    }

    const tagNames = character.tag_names
        ? character.tag_names.split('|')
        : [];

    tagNames.forEach((tagName) => {
        const tagElement = document.createElement('span');

        tagElement.className = 'tag blue';
        tagElement.textContent = tagName;

        tagsContainer.appendChild(tagElement);
    });

    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(tagsContainer);

    article.appendChild(imageContainer);
    article.appendChild(info);

    return article;
}

/*
 * ============================================================
 * PERSONNAGE ALEATOIRE
 * ============================================================
 */

async function initializeRandomPage() {
    const randomButton =
        document.getElementById('random-button');

    randomButton.addEventListener(
        'click',
        loadRandomCharacter
    );

    try {
        const response =
            await fetch(`${API_URL}/universes`);

        if (!response.ok) {
            throw new Error(
                'Impossible de récupérer les univers.'
            );
        }

        const data =
            await response.json();

        universes = data.universes;

    } catch (error) {
        console.error(
            'Erreur lors du chargement des univers :',
            error
        );
    }

    loadRandomCharacter();
}


async function loadRandomCharacter() {
    const randomButton =
        document.getElementById('random-button');

    const loading =
        document.getElementById('random-loading');

    const error =
        document.getElementById('random-error');

    const character =
        document.getElementById('random-character');

    randomButton.disabled = true;

    loading.hidden = false;
    error.hidden = true;
    character.hidden = true;

    try {
        const [response] = await Promise.all([
            fetch(`${API_URL}/characters/random`),
            new Promise((resolve) => {
                setTimeout(resolve, 3000);
            })
        ]);

        if (!response.ok) {
            throw new Error(
                'Impossible de récupérer le personnage.'
            );
        }

        const randomCharacter =
            await response.json();

        if (!randomCharacter || !randomCharacter.id) {
            throw new Error(
                'Aucun personnage disponible.'
            );
        }

        displayRandomCharacter(randomCharacter);

        error.hidden = true;
        character.hidden = false;

    } catch (requestError) {
        console.error(
            'Erreur lors de la récupération du personnage aléatoire :',
            requestError
        );

        error.textContent =
            requestError.message ||
            'Impossible de récupérer un personnage.';

        error.hidden = false;

    } finally {
        loading.hidden = true;
        randomButton.disabled = false;
    }
}


function displayRandomCharacter(character) {
    const image =
        document.getElementById('random-image');

    const name =
        document.getElementById('random-name');

    const description =
        document.getElementById('random-description');

    const tags =
        document.getElementById('random-tags');

    const details =
        document.getElementById('random-details');

    image.src =
        character.illustration ||
        character.icon ||
        'https://placehold.co/700x900?text=Anibook';

    image.alt =
        character.name;

    name.textContent =
        character.name;

    description.textContent =
        character.description ||
        'Aucune description disponible.';

    tags.innerHTML = '';

    const universe =
        universes.find(
            (item) =>
                item.id === character.universe_id
        );

    if (universe) {
        const universeTag =
            document.createElement('span');

        universeTag.className =
            'tag';

        universeTag.textContent =
            universe.name;

        tags.appendChild(universeTag);
    }

    details.href =
        `character.html?id=${character.id}`;
}


async function initializeCharacterDetailPage() {
    const loading =
        document.getElementById('character-detail-loading');

    const error =
        document.getElementById('character-detail-error');

    const content =
        document.getElementById('character-detail-content');

    const characterId =
        new URLSearchParams(window.location.search).get('id');

    if (!characterId || !/^\d+$/.test(characterId)) {
        loading.hidden = true;
        error.textContent =
            'Personnage introuvable.';
        error.hidden = false;
        return;
    }

    try {
        const [characterResponse, tagsResponse] =
            await Promise.all([
                fetch(`${API_URL}/characters/${characterId}`),
                fetch(`${API_URL}/characters/${characterId}/tags`)
            ]);

        if (!characterResponse.ok || !tagsResponse.ok) {
            throw new Error(
                'Impossible de charger ce personnage.'
            );
        }

        const character = await characterResponse.json();
        const tagsData = await tagsResponse.json();
        const tags = tagsData.tags || [];

        document.getElementById('character-detail-image').src =
            character.illustration ||
            character.icon ||
            'https://placehold.co/700x900?text=Anibook';

        document.getElementById('character-detail-image').alt =
            character.name;

        document.getElementById('character-detail-name')
            .textContent = character.name;

        document.getElementById('character-detail-description')
            .textContent = character.description ||
                'Aucune description disponible.';

        document.getElementById('character-detail-universe')
            .textContent = character.universe ||
                'Univers inconnu';

        const tagsContainer =
            document.getElementById('character-detail-tags');

        tagsContainer.innerHTML = '';

        tags.forEach((tag) => {
            const tagElement = document.createElement('span');

            tagElement.className = 'tag blue';
            tagElement.textContent = tag.name;
            tagsContainer.appendChild(tagElement);
        });

        loading.hidden = true;
        error.hidden = true;
        content.hidden = false;
    } catch (requestError) {
        console.error(
            'Erreur lors du chargement du personnage :',
            requestError
        );

        loading.hidden = true;
        content.hidden = true;
        error.textContent = requestError.message;
        error.hidden = false;
    }
}

/*
 * ============================================================
 * ADMINISTRATION
 * ============================================================
 */

let adminCharacters = [];
let adminUniverses = [];
let adminTags = [];
let adminQecSessions = [];

let editingCharacterId = null;
let editingUniverseId = null;
let editingTagId = null;
let selectedCharacterTagIds = [];


async function initializeAdminPage() {
    setupAdminResourceSelector();

    setupCharacterAdmin();
    setupCharacterTagPicker();
    setupUniverseAdmin();
    setupTagAdmin();

    await loadAdminData();
}


/*
 * ============================================================
 * SELECTION PERSONNAGES / UNIVERS / TAGS
 * ============================================================
 */

function setupAdminResourceSelector() {
    const selector =
        document.getElementById('admin-resource');

    selector.addEventListener(
        'change',
        () => {
            const resource =
                selector.value;

            document
                .getElementById('characters-admin')
                .hidden = resource !== 'characters';

            document
                .getElementById('universes-admin')
                .hidden = resource !== 'universes';

            document
                .getElementById('tags-admin')
                .hidden = resource !== 'tags';

            document
                .getElementById('qec-sessions-admin')
                .hidden = resource !== 'qec-sessions';
        }
    );
}


/*
 * ============================================================
 * CHARGEMENT
 * ============================================================
 */

async function loadAdminData() {
    try {
        const [
            charactersResponse,
            universesResponse,
            tagsResponse,
            sessionsResponse
        ] = await Promise.all([
            fetch(`${API_URL}/characters`),
            fetch(`${API_URL}/universes`),
            fetch(`${API_URL}/tags`),
            fetch(`${API_URL}/qec/sessions`)
        ]);

        if (
            !charactersResponse.ok ||
            !universesResponse.ok ||
            !tagsResponse.ok ||
            !sessionsResponse.ok
        ) {
            throw new Error(
                'Impossible de récupérer les données.'
            );
        }

        const charactersData =
            await charactersResponse.json();

        const universesData =
            await universesResponse.json();

        const tagsData =
            await tagsResponse.json();

        const sessionsData =
            await sessionsResponse.json();

        adminCharacters = charactersData.characters;
        adminUniverses = universesData.universes;
        adminTags = tagsData.tags;
        adminQecSessions = sessionsData.sessions;

        populateAdminUniverses();

        renderAdminCharacters();
        renderAdminUniverses();
        renderAdminTags();
        renderAdminQecSessions();

        document.getElementById('delete-all-qec-sessions')
            .onclick = deleteAllAdminQecSessions;

    } catch (error) {
        console.error(
            'Erreur lors du chargement de l administration :',
            error
        );

        showAdminMessage(
            error.message,
            true
        );
    }
}


/*
 * ============================================================
 * PERSONNAGES
 * ============================================================
 */

function setupCharacterAdmin() {
    const form =
        document.getElementById('character-form');

    form.addEventListener(
        'submit',
        handleCharacterSubmit
    );

    document
        .getElementById('cancel-character-edit')
        .addEventListener(
            'click',
            cancelCharacterEdit
        );
}


function setupCharacterTagPicker() {
    const input =
        document.getElementById('character-tags');

    const picker =
        document.getElementById('character-tag-picker');

    input.addEventListener(
        'input',
        renderCharacterTagSuggestions
    );

    input.addEventListener(
        'focus',
        renderCharacterTagSuggestions
    );

    document.addEventListener(
        'click',
        (event) => {
            if (!picker.contains(event.target)) {
                document.getElementById(
                    'character-tag-suggestions'
                ).hidden = true;
            }
        }
    );
}


function renderCharacterTagSuggestions() {
    const input =
        document.getElementById('character-tags');

    const suggestions =
        document.getElementById(
            'character-tag-suggestions'
        );

    const search =
        input.value.trim().toLowerCase();

    const matchingTags = adminTags
        .filter((tag) => {
            return !selectedCharacterTagIds.includes(tag.id) &&
                tag.name.toLowerCase().includes(search);
        })
        .sort((firstTag, secondTag) => {
            const firstStartsWithSearch =
                firstTag.name.toLowerCase().startsWith(search);

            const secondStartsWithSearch =
                secondTag.name.toLowerCase().startsWith(search);

            return Number(secondStartsWithSearch) -
                Number(firstStartsWithSearch) ||
                firstTag.name.localeCompare(secondTag.name);
        })
        .slice(0, 5);

    suggestions.innerHTML = '';

    matchingTags.forEach((tag) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'tag-suggestion';
        button.textContent = tag.name;

        button.addEventListener(
            'click',
            () => selectCharacterTag(tag)
        );

        suggestions.appendChild(button);
    });

    suggestions.hidden = matchingTags.length === 0;
}


function selectCharacterTag(tag) {
    if (selectedCharacterTagIds.includes(tag.id)) {
        return;
    }

    selectedCharacterTagIds.push(tag.id);

    document.getElementById('character-tags').value = '';

    renderSelectedCharacterTags();
    renderCharacterTagSuggestions();
}


function removeCharacterTag(tagId) {
    selectedCharacterTagIds =
        selectedCharacterTagIds.filter(
            (id) => id !== tagId
        );

    renderSelectedCharacterTags();
    renderCharacterTagSuggestions();
}


function renderSelectedCharacterTags() {
    const container =
        document.getElementById('selected-character-tags');

    container.innerHTML = '';

    selectedCharacterTagIds.forEach((tagId) => {
        const tag = adminTags.find(
            (item) => item.id === tagId
        );

        if (!tag) {
            return;
        }

        const tagElement = document.createElement('span');

        tagElement.className = 'selected-tag';
        tagElement.textContent = tag.name;

        const removeButton = document.createElement('button');

        removeButton.type = 'button';
        removeButton.className = 'selected-tag-remove';
        removeButton.setAttribute(
            'aria-label',
            `Retirer le tag ${tag.name}`
        );
        removeButton.textContent = '×';

        removeButton.addEventListener(
            'click',
            () => removeCharacterTag(tag.id)
        );

        tagElement.appendChild(removeButton);
        container.appendChild(tagElement);
    });
}


function populateAdminUniverses() {
    const select =
        document.getElementById('character-universe');

    select.innerHTML = `
        <option value="">
            Sélectionner un univers
        </option>
    `;

    adminUniverses.forEach((universe) => {
        const option =
            document.createElement('option');

        option.value = universe.id;
        option.textContent = universe.name;

        select.appendChild(option);
    });
}


async function handleCharacterSubmit(event) {
    event.preventDefault();

    const name =
        document.getElementById('character-name')
            .value
            .trim();

    const universeId =
        document.getElementById('character-universe')
            .value;

    const image =
        document.getElementById('character-image')
            .value
            .trim();

    const description =
        document.getElementById('character-description')
            .value
            .trim();

    const character = {
        name,
        universe_id: Number(universeId),
        icon: image || null,
        illustration: image || null,
        description: description || null
    };

    try {
        if (editingCharacterId === null) {
            await createAdminCharacter(
                character,
                selectedCharacterTagIds
            );
        } else {
            await updateAdminCharacter(
                editingCharacterId,
                character
            );
        }

        clearCharacterForm();

        await loadAdminData();

    } catch (error) {
        showAdminMessage(
            error.message,
            true
        );
    }
}


async function createAdminCharacter(
    character,
    tagIds
) {
    const response =
        await fetch(`${API_URL}/characters`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(character)
        });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
            error?.error || 'Impossible de créer le personnage.'
        );
    }

    const created =
        await response.json();

    await addCharacterTags(
        created.id,
        tagIds
    );

    showAdminMessage(
        'Personnage créé avec succès.'
    );
}


async function updateAdminCharacter(
    id,
    character
) {
    const response =
        await fetch(
            `${API_URL}/characters/${id}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(character)
            }
        );

    if (!response.ok) {
        throw new Error(
            'Impossible de modifier le personnage.'
        );
    }

    showAdminMessage(
        'Personnage modifié avec succès.'
    );
}


function startCharacterEdit(id) {
    const character =
        adminCharacters.find(
            (item) => item.id === id
        );

    if (!character) {
        return;
    }

    editingCharacterId = id;

    document.getElementById(
        'character-name'
    ).value = character.name;

    document.getElementById(
        'character-universe'
    ).value = character.universe_id;

    document.getElementById(
        'character-image'
    ).value =
        character.illustration ||
        character.icon ||
        '';

    document.getElementById(
        'character-description'
    ).value =
        character.description || '';

    document.getElementById(
        'character-form-title'
    ).textContent =
        'Modifier un personnage';

    document.getElementById(
        'submit-character'
    ).textContent =
        'Enregistrer les modifications';

    document.getElementById(
        'cancel-character-edit'
    ).hidden = false;

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function cancelCharacterEdit() {
    clearCharacterForm();
}


function clearCharacterForm() {
    document
        .getElementById('character-form')
        .reset();

    editingCharacterId = null;
    selectedCharacterTagIds = [];

    renderSelectedCharacterTags();

    document.getElementById(
        'character-tag-suggestions'
    ).hidden = true;

    document.getElementById(
        'character-form-title'
    ).textContent =
        'Ajouter un personnage';

    document.getElementById(
        'submit-character'
    ).textContent =
        '+ Ajouter le personnage';

    document.getElementById(
        'cancel-character-edit'
    ).hidden = true;
}


async function deleteAdminCharacter(id) {
    const character =
        adminCharacters.find(
            (item) => item.id === id
        );

    if (!character) {
        return;
    }

    if (
        !confirm(
            `Supprimer "${character.name}" ?`
        )
    ) {
        return;
    }

    const response =
        await fetch(
            `${API_URL}/characters/${id}`,
            {
                method: 'DELETE'
            }
        );

    if (!response.ok) {
        throw new Error(
            'Impossible de supprimer le personnage.'
        );
    }

    await loadAdminData();

    showAdminMessage(
        'Personnage supprimé avec succès.'
    );
}


function renderAdminCharacters() {
    const tbody =
        document.getElementById(
            'characters-table-body'
        );

    const total =
        document.getElementById(
            'characters-total'
        );

    const loading =
        document.getElementById(
            'admin-loading'
        );

    loading.hidden = true;

    total.textContent =
        `${adminCharacters.length} personnage${
            adminCharacters.length > 1 ? 's' : ''
        }`;

    tbody.innerHTML = '';

    adminCharacters.forEach((character) => {

        const row =
            document.createElement('tr');

        const universe =
            adminUniverses.find(
                (item) =>
                    item.id === character.universe_id
            );

        row.innerHTML = `
            <td>#${String(character.id).padStart(3, '0')}</td>

            <td>${escapeHtml(character.name)}</td>

            <td>${escapeHtml(
                universe?.name || 'Inconnu'
            )}</td>

            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    data-edit-character="${character.id}"
                >
                    Modifier
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    data-delete-character="${character.id}"
                >
                    Supprimer
                </button>
            </td>
        `;

        row
            .querySelector(
                '[data-edit-character]'
            )
            .addEventListener(
                'click',
                () => startCharacterEdit(character.id)
            );

        row
            .querySelector(
                '[data-delete-character]'
            )
            .addEventListener(
                'click',
                () => deleteAdminCharacter(character.id)
            );

        tbody.appendChild(row);
    });
}


/*
 * ============================================================
 * UNIVERS
 * ============================================================
 */

function setupUniverseAdmin() {
    document
        .getElementById('universe-form')
        .addEventListener(
            'submit',
            handleUniverseSubmit
        );

    document
        .getElementById('cancel-universe-edit')
        .addEventListener(
            'click',
            clearUniverseForm
        );
}


async function handleUniverseSubmit(event) {
    event.preventDefault();

    const name =
        document.getElementById('universe-name')
            .value
            .trim();

    if (!name) {
        return;
    }

    try {
        if (editingUniverseId === null) {

            const response =
                await fetch(
                    `${API_URL}/universes`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            name
                        })
                    }
                );

            if (!response.ok) {
                throw new Error(
                    'Impossible de créer l univers.'
                );
            }

            showAdminMessage(
                'Univers créé avec succès.'
            );

        } else {

            const response =
                await fetch(
                    `${API_URL}/universes/${editingUniverseId}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            name
                        })
                    }
                );

            if (!response.ok) {
                throw new Error(
                    'Impossible de modifier l univers.'
                );
            }

            showAdminMessage(
                'Univers modifié avec succès.'
            );
        }

        clearUniverseForm();

        await loadAdminData();

    } catch (error) {
        showAdminMessage(
            error.message,
            true
        );
    }
}


function startUniverseEdit(id) {
    const universe =
        adminUniverses.find(
            (item) => item.id === id
        );

    if (!universe) {
        return;
    }

    editingUniverseId = id;

    document.getElementById(
        'universe-name'
    ).value = universe.name;

    document.getElementById(
        'universe-form-title'
    ).textContent =
        'Modifier un univers';

    document.getElementById(
        'submit-universe'
    ).textContent =
        'Enregistrer les modifications';

    document.getElementById(
        'cancel-universe-edit'
    ).hidden = false;
}


function clearUniverseForm() {
    document
        .getElementById('universe-form')
        .reset();

    editingUniverseId = null;

    document.getElementById(
        'universe-form-title'
    ).textContent =
        'Ajouter un univers';

    document.getElementById(
        'submit-universe'
    ).textContent =
        '+ Ajouter l univers';

    document.getElementById(
        'cancel-universe-edit'
    ).hidden = true;
}


async function deleteAdminUniverse(id) {
    const universe =
        adminUniverses.find(
            (item) => item.id === id
        );

    if (!universe) {
        return;
    }

    if (
        !confirm(
            `Supprimer l univers "${universe.name}" ?`
        )
    ) {
        return;
    }

    const response =
        await fetch(
            `${API_URL}/universes/${id}`,
            {
                method: 'DELETE'
            }
        );

    if (!response.ok) {
        throw new Error(
            'Impossible de supprimer l univers. Il est peut-être utilisé par un personnage.'
        );
    }

    await loadAdminData();

    showAdminMessage(
        'Univers supprimé avec succès.'
    );
}


function renderAdminUniverses() {
    const tbody =
        document.getElementById(
            'universes-table-body'
        );

    tbody.innerHTML = '';

    adminUniverses.forEach((universe) => {

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td>#${String(universe.id).padStart(3, '0')}</td>

            <td>${escapeHtml(universe.name)}</td>

            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    data-edit-universe="${universe.id}"
                >
                    Modifier
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    data-delete-universe="${universe.id}"
                >
                    Supprimer
                </button>
            </td>
        `;

        row
            .querySelector(
                '[data-edit-universe]'
            )
            .addEventListener(
                'click',
                () => startUniverseEdit(universe.id)
            );

        row
            .querySelector(
                '[data-delete-universe]'
            )
            .addEventListener(
                'click',
                () => deleteAdminUniverse(universe.id)
            );

        tbody.appendChild(row);
    });
}


/*
 * ============================================================
 * TAGS
 * ============================================================
 */

function setupTagAdmin() {
    document
        .getElementById('tag-form')
        .addEventListener(
            'submit',
            handleTagSubmit
        );

    document
        .getElementById('cancel-tag-edit')
        .addEventListener(
            'click',
            clearTagForm
        );
}


async function handleTagSubmit(event) {
    event.preventDefault();

    const name =
        document.getElementById('tag-name')
            .value
            .trim();

    if (!name) {
        return;
    }

    try {
        const method =
            editingTagId === null
                ? 'POST'
                : 'PUT';

        const url =
            editingTagId === null
                ? `${API_URL}/tags`
                : `${API_URL}/tags/${editingTagId}`;

        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        name
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                editingTagId === null
                    ? 'Impossible de créer le tag.'
                    : 'Impossible de modifier le tag.'
            );
        }

        showAdminMessage(
            editingTagId === null
                ? 'Tag créé avec succès.'
                : 'Tag modifié avec succès.'
        );

        clearTagForm();

        await loadAdminData();

    } catch (error) {
        showAdminMessage(
            error.message,
            true
        );
    }
}


function startTagEdit(id) {
    const tag =
        adminTags.find(
            (item) => item.id === id
        );

    if (!tag) {
        return;
    }

    editingTagId = id;

    document.getElementById(
        'tag-name'
    ).value = tag.name;

    document.getElementById(
        'tag-form-title'
    ).textContent =
        'Modifier un tag';

    document.getElementById(
        'submit-tag'
    ).textContent =
        'Enregistrer les modifications';

    document.getElementById(
        'cancel-tag-edit'
    ).hidden = false;
}


function clearTagForm() {
    document
        .getElementById('tag-form')
        .reset();

    editingTagId = null;

    document.getElementById(
        'tag-form-title'
    ).textContent =
        'Ajouter un tag';

    document.getElementById(
        'submit-tag'
    ).textContent =
        '+ Ajouter le tag';

    document.getElementById(
        'cancel-tag-edit'
    ).hidden = true;
}


async function deleteAdminTag(id) {
    const tag =
        adminTags.find(
            (item) => item.id === id
        );

    if (!tag) {
        return;
    }

    if (
        !confirm(
            `Supprimer le tag "${tag.name}" ?`
        )
    ) {
        return;
    }

    const response =
        await fetch(
            `${API_URL}/tags/${id}`,
            {
                method: 'DELETE'
            }
        );

    if (!response.ok) {
        throw new Error(
            'Impossible de supprimer le tag.'
        );
    }

    await loadAdminData();

    showAdminMessage(
        'Tag supprimé avec succès.'
    );
}


function renderAdminTags() {
    const tbody =
        document.getElementById(
            'tags-table-body'
        );

    tbody.innerHTML = '';

    adminTags.forEach((tag) => {

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td>#${String(tag.id).padStart(3, '0')}</td>

            <td>
                <span class="tag">
                    ${escapeHtml(tag.name)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    data-edit-tag="${tag.id}"
                >
                    Modifier
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    data-delete-tag="${tag.id}"
                >
                    Supprimer
                </button>
            </td>
        `;

        row
            .querySelector(
                '[data-edit-tag]'
            )
            .addEventListener(
                'click',
                () => startTagEdit(tag.id)
            );

        row
            .querySelector(
                '[data-delete-tag]'
            )
            .addEventListener(
                'click',
                () => deleteAdminTag(tag.id)
            );

        tbody.appendChild(row);
    });
}


/*
 * ============================================================
 * TAGS D'UN PERSONNAGE
 * ============================================================
 */

async function addCharacterTags(
    characterId,
    tagIds
) {
    if (tagIds.length === 0) {
        return;
    }

    for (const tagId of tagIds) {
        const tag = adminTags.find(
            (item) => item.id === tagId
        );

        const relationResponse =
            await fetch(
                `${API_URL}/characters/${characterId}/tags/${tagId}`,
                {
                    method: 'POST'
                }
            );

        if (
            !relationResponse.ok &&
            relationResponse.status !== 409
        ) {
            throw new Error(
                `Impossible d associer le tag "${tag.name}".`
            );
        }
    }
}


/*
 * ============================================================
 * UTILITAIRES
 * ============================================================
 */

function showAdminMessage(
    message,
    isError = false
) {
    const element =
        document.getElementById(
            'admin-message'
        );

    element.textContent =
        message;

    element.hidden = false;

    if (isError) {
        element.classList.add('error');
    } else {
        element.classList.remove('error');
    }

    setTimeout(() => {
        element.hidden = true;
    }, 4000);
}


function escapeHtml(value) {
    const div =
        document.createElement('div');

    div.textContent =
        value ?? '';

    return div.innerHTML;
}


async function loadCharacters() {
    const loading =
        document.getElementById('characters-loading');

    const empty =
        document.getElementById('characters-empty');

    const grid =
        document.getElementById('characters-grid');

    if (characterRequestController) {
        characterRequestController.abort();
    }

    characterRequestController = new AbortController();

    const query = new URLSearchParams({
        limit: '50'
    });

    if (currentSearch) {
        query.set('search', currentSearch);
    }

    if (currentUniverse) {
        query.set('universeId', currentUniverse);
    }

    if (currentTag) {
        query.set('tagId', currentTag);
    }

    loading.textContent =
        'Chargement des personnages...';
    loading.hidden = false;
    empty.hidden = true;
    grid.innerHTML = '';

    try {
        const response = await fetch(
            `${API_URL}/characters?${query.toString()}`,
            {
                signal: characterRequestController.signal
            }
        );

        if (!response.ok) {
            throw new Error(
                'Impossible de récupérer les personnages.'
            );
        }

        const data = await response.json();

        characters = Array.isArray(data)
            ? data
            : data.characters || [];

        renderCharacters();
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }

        console.error(
            'Erreur lors du chargement des personnages :',
            error
        );

        loading.textContent =
            'Impossible de charger les personnages.';
        loading.hidden = false;
        empty.hidden = true;
        grid.innerHTML = '';
    }
}


let whoGameCharacters = [];
let whoGameUniverses = [];
let whoGameTags = [];
let whoGameSessions = [];
let whoGameEliminated = new Set();
let whoGameRevealed = new Set();


async function initializeWhoGamePage() {
    try {
        const [charactersResponse, universesResponse, tagsResponse] =
            await Promise.all([
                fetch(`${API_URL}/characters?limit=50`),
                fetch(`${API_URL}/universes`),
                fetch(`${API_URL}/tags`)
            ]);

        if (!charactersResponse.ok || !universesResponse.ok || !tagsResponse.ok) {
            throw new Error('Impossible de charger les données du plateau.');
        }

        const charactersData = await charactersResponse.json();
        const universesData = await universesResponse.json();
        const tagsData = await tagsResponse.json();

        whoGameCharacters = charactersData.characters || charactersData;
        whoGameUniverses = universesData.universes || universesData;
        whoGameTags = tagsData.tags || tagsData;

        populateWhoGameSelect(
            'quiz-universe-filter',
            whoGameUniverses
        );

        populateWhoGameSelect(
            'quiz-tag-filter',
            whoGameTags
        );


            document.getElementById('quiz-refresh-sessions')
                .addEventListener('click', loadWhoGameSessions);

        document.getElementById('quiz-start')
            .addEventListener('click', startWhoGame);

        document.getElementById('quiz-universe-filter')
            .addEventListener('change', updateWhoGameCharacterCount);

        document.getElementById('quiz-tag-filter')
            .addEventListener('change', updateWhoGameCharacterCount);

        document.getElementById('quiz-show-eliminated')
            .addEventListener('click', toggleWhoGameEliminated);

        document.getElementById('quiz-back-to-sessions')
            .addEventListener('click', showWhoGameSetup);

        document.getElementById('quiz-session-search')
            .addEventListener('input', renderWhoGameSessions);

        updateWhoGameCharacterCount();
        await loadWhoGameSessions();
        restoreWhoGameCreatedCode();
        await restoreWhoGameSession();
    } catch (error) {
        showWhoGameMessage(error.message, true);
    }
}


function populateWhoGameSelect(selectId, values) {
    const select = document.getElementById(selectId);

    values.forEach((value) => {
        const option = document.createElement('option');

        option.value = value.id;
        option.textContent = value.name;

        select.appendChild(option);
    });
}


function getWhoGameCandidates() {
    const universeId = document.getElementById('quiz-universe-filter').value;
    const tagId = document.getElementById('quiz-tag-filter').value;

    return whoGameCharacters.filter((character) => {
        const matchesUniverse = !universeId ||
            String(character.universe_id) === String(universeId);

        const tagIds = character.tag_ids
            ? character.tag_ids.split('|')
            : [];

        const selectedTag = whoGameTags.find(
            (tag) => String(tag.id) === String(tagId)
        );

        const matchesTag = !tagId ||
            (character.tag_names || '').split('|').includes(selectedTag?.name);

        return matchesUniverse && matchesTag;
    });
}


function updateWhoGameCharacterCount() {
    const candidates = getWhoGameCandidates();
    const count = document.getElementById('quiz-character-count');

    count.textContent = `${candidates.length} personnage${candidates.length > 1 ? 's' : ''}`;
}


function generateWhoGameCode() {
    return `ANI${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}


async function loadWhoGameSessions() {
    const list = document.getElementById('quiz-session-list');

    list.innerHTML =
        '<span class="loading-inline">Chargement des parties...</span>';

    try {
        const response = await fetch(`${API_URL}/qec/sessions`);

        if (!response.ok) {
            throw new Error('Impossible de charger les parties.');
        }

        const data = await response.json();
        whoGameSessions = data.sessions || [];

        renderWhoGameSessions();
    } catch (error) {
        const list = document.getElementById('quiz-session-list');

        list.innerHTML =
            `<p class="who-session-empty">${escapeHtml(error.message)}</p>`;
    }
}


function renderWhoGameSessions() {
    const list = document.getElementById('quiz-session-list');
    const search = document.getElementById('quiz-session-search')
        .value.trim().toLowerCase();
    const sessions = whoGameSessions.filter((session) => {
        const filters = [session.code, session.universe, session.tag]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return filters.includes(search);
    });

    list.innerHTML = '';

    if (sessions.length === 0) {
        list.innerHTML =
            '<p class="who-session-empty">Aucune partie disponible.</p>';
        return;
    }

    sessions.forEach((session) => {
        const item = document.createElement('article');
        const filters = [session.universe, session.tag]
            .filter(Boolean)
            .join(' / ') || 'Tous les personnages';

        item.className = 'who-session-item';
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(session.code)}</strong>
                <span>${escapeHtml(filters)}</span>
                <small>${session.character_count} cartes</small>
            </div>
            <button type="button" class="btn btn-sm btn-primary">Rejoindre</button>
        `;

        item.querySelector('button').addEventListener(
            'click',
            () => joinWhoGame(session.code)
        );

        list.appendChild(item);
    });
}


function createWhoGameSeed(code) {
    let seed = 0;

    for (let index = 0; index < code.length; index += 1) {
        seed = (seed * 31 + code.charCodeAt(index)) >>> 0;
    }

    return seed || 1;
}


function shuffleWhoGameCharacters(characters, seed) {
    const shuffled = [...characters];
    let currentSeed = seed;

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
        const swapIndex = currentSeed % (index + 1);
        [shuffled[index], shuffled[swapIndex]] =
            [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
}


async function startWhoGame() {
    const boardSize = Number(document.getElementById('quiz-board-size').value);
    const candidates = getWhoGameCandidates();

    if (candidates.length === 0) {
        showWhoGameMessage('Aucun personnage ne correspond aux filtres.', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/qec/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boardSize,
                universeId: document.getElementById('quiz-universe-filter').value || null,
                tagId: document.getElementById('quiz-tag-filter').value || null
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error || 'Impossible de créer la partie.');
        }

        const session = await response.json();
        localStorage.removeItem('anibook-active-qec-session');
        document.getElementById('who-board').hidden = true;
        document.getElementById('who-step-one-grid').hidden = false;
        showWhoGameCreatedCode(session.code);
        await loadWhoGameSessions();
    } catch (error) {
        showWhoGameMessage(error.message, true);
    }
}


async function joinWhoGame(code) {
    try {
        const response = await fetch(
            `${API_URL}/qec/sessions/${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error || 'Partie introuvable.');
        }

        localStorage.removeItem('anibook-created-qec-code');
        displayWhoGameSession(await response.json(), true);
    } catch (error) {
        showWhoGameMessage(error.message, true);
    }
}


function displayWhoGameSession(session, isJoinedSession) {
    whoGameEliminated = new Set();
    whoGameRevealed = new Set();

    localStorage.setItem(
        'anibook-active-qec-session',
        session.code
    );

    if (isJoinedSession) {
        localStorage.removeItem('anibook-created-qec-code');
        document.getElementById('quiz-created-code').hidden = true;
    }

    document.getElementById('quiz-active-code').textContent = `#${session.code}`;
    document.getElementById('who-board').hidden = false;
    document.getElementById('quiz-setup-message').hidden = true;

    document.getElementById('who-step-one-grid').hidden = isJoinedSession;

    renderWhoGameBoard(session.characters || []);
}


async function restoreWhoGameSession() {
    const code = localStorage.getItem(
        'anibook-active-qec-session'
    );

    if (!code) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/qec/sessions/${encodeURIComponent(code)}`
        );

        if (!response.ok) {
            localStorage.removeItem('anibook-active-qec-session');
            return;
        }

        displayWhoGameSession(
            await response.json(),
            true
        );
    } catch (error) {
        console.error(
            'Impossible de restaurer la partie QEC :',
            error
        );
    }
}


function showWhoGameSetup() {
    localStorage.removeItem('anibook-active-qec-session');
    document.getElementById('who-step-one-grid').hidden = false;
    document.getElementById('who-board').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function renderWhoGameBoard(characters) {
    const grid = document.getElementById('quiz-board-grid');

    grid.innerHTML = '';

    characters.forEach((character) => {
        const card = document.createElement('button');
        const isRevealed = whoGameRevealed.has(character.id);
        const isEliminated = whoGameEliminated.has(character.id);

        card.type = 'button';
        card.className = `who-card${isRevealed ? ' is-revealed' : ''}${isEliminated ? ' is-eliminated' : ''}`;
        card.setAttribute('aria-label', `Carte ${character.name}`);

        const image = character.illustration || character.icon ||
            'https://placehold.co/400x520?text=Anibook';

        card.innerHTML = `
            <span class="who-card-inner">
                <span class="who-card-front">?</span>
                <span class="who-card-back">
                    <img src="${escapeHtml(image)}" alt="">
                    <strong>${escapeHtml(character.name)}</strong>
                    <small>${escapeHtml(character.universe || '')}</small>
                </span>
            </span>
        `;

        card.addEventListener('click', () => {
            if (whoGameEliminated.has(character.id)) {
                whoGameEliminated.delete(character.id);
            } else if (whoGameRevealed.has(character.id)) {
                whoGameEliminated.add(character.id);
            } else {
                whoGameRevealed.add(character.id);
            }

            renderWhoGameBoard(characters);
            updateWhoGameStats(characters.length);
        });

        grid.appendChild(card);
    });

    updateWhoGameStats(characters.length);
}


function updateWhoGameStats(total) {
    document.getElementById('quiz-visible-count').textContent =
        `${total - whoGameEliminated.size} visibles`;
    document.getElementById('quiz-hidden-count').textContent =
        `${whoGameEliminated.size} éliminées`;
}


function toggleWhoGameEliminated() {
    const button = document.getElementById('quiz-show-eliminated');
    const board = document.getElementById('who-board-grid');

    board.classList.toggle('show-eliminated');
    button.textContent = board.classList.contains('show-eliminated')
        ? 'Masquer les cartes éliminées'
        : 'Afficher les cartes éliminées';
}


function showWhoGameMessage(message, isError = false) {
    const element = document.getElementById('quiz-setup-message');

    element.textContent = message;
    element.classList.toggle('error', isError);
    element.hidden = false;
}


function renderAdminQecSessions() {
    const tbody = document.getElementById(
        'qec-sessions-table-body'
    );

    tbody.innerHTML = '';

    adminQecSessions.forEach((session) => {
        const row = document.createElement('tr');
        const filters = [session.universe, session.tag]
            .filter(Boolean)
            .join(' / ') || 'Tous les personnages';

        row.innerHTML = `
            <td><strong>${escapeHtml(session.code)}</strong></td>
            <td>${escapeHtml(filters)}</td>
            <td>${session.character_count}</td>
            <td>${escapeHtml(new Date(session.created_at).toLocaleString('fr-FR'))}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    data-delete-qec-session="${session.id}"
                >
                    Supprimer
                </button>
            </td>
        `;

        row.querySelector('[data-delete-qec-session]')
            .addEventListener(
                'click',
                () => deleteAdminQecSession(session.id, session.code)
            );

        tbody.appendChild(row);
    });
}


async function deleteAdminQecSession(id, code) {
    if (!confirm(`Supprimer la partie QEC "${code}" ?`)) {
        return;
    }

    const response = await fetch(
        `${API_URL}/qec/sessions/${id}`,
        { method: 'DELETE' }
    );

    if (!response.ok) {
        throw new Error('Impossible de supprimer la partie QEC.');
    }

    await loadAdminData();
    showAdminMessage('Partie QEC supprimée avec succès.');
}


function showWhoGameCreatedCode(code) {
    localStorage.setItem(
        'anibook-created-qec-code',
        code
    );

    document.getElementById('quiz-created-code-value')
        .textContent = code;
    document.getElementById('quiz-created-code').hidden = false;
}


function restoreWhoGameCreatedCode() {
    const code = localStorage.getItem(
        'anibook-created-qec-code'
    );

    if (code) {
        showWhoGameCreatedCode(code);
    }
}


async function deleteAllAdminQecSessions() {
    if (adminQecSessions.length === 0) {
        showAdminMessage('Aucune session QEC à supprimer.');
        return;
    }

    if (!confirm('Supprimer toutes les sessions QEC ?')) {
        return;
    }

    const response = await fetch(
        `${API_URL}/qec/sessions/all`,
        { method: 'DELETE' }
    );

    if (!response.ok) {
        throw new Error('Impossible de supprimer les sessions QEC.');
    }

    await loadAdminData();
    showAdminMessage('Toutes les sessions QEC ont été supprimées.');
}