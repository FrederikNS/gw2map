import axios from 'axios'
import Immutable from 'immutable'
import Continent from 'javascript/model/continent'
import Floor from 'javascript/model/floor'

function postProcess(response) {
  return Immutable.fromJS(response.data)
}

export function getContinents() {
  return axios.get('https://api.guildwars2.com/v2/continents', {params: {ids: 'all'}})
    .then(postProcess)
    .then(rawContinents => rawContinents.map(continent => new Continent(continent)))
}

export function getFloor(continentId, floorId) {
  return axios.get(`https://api.guildwars2.com/v2/continents/${continentId}/floors/${floorId}`)
    .then(postProcess)
    .then(x => new Floor(x))
}

export function getIcons() {
  return axios.get('https://api.guildwars2.com/v2/files', {
    params: {
      ids: Immutable.List([
        'map_waypoint',
        'map_dungeon',
        'map_heart_empty',
        'map_poi',
        'map_heropoint',
        'map_vista'
      ]).join(',')
    }
  }).then(postProcess)
    .then(x=>x.groupBy(y=>y.get('id'))
    .map(x=>x.first().get('icon')))
}
