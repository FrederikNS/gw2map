(function(){
    "use strict";
    var attribution = '<a href="#" data-toggle="modal" data-target="#copyrightModal">Copyright Notice</a>';
    var continents = $.getJSON('https://api.guildwars2.com/v1/continents.json');
    var floor = $.getJSON('https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=0');
    var files = $.getJSON('https://api.guildwars2.com/v1/files.json');
    var falseMaps = [589, 711, 807, 905, 1005];
    var falseDungeons = [1822, 1935, 1936, 1937, 1938];

    continents.done(function(continents) {
        var selectedContinent = 1;
        var startFloor = 2;
        var baseLayers = {};
        var layerFix = {0: 1, 1: 2, 2: 3, 3: 0};
        [0,1,2,3].forEach(function(floor_id) {
            baseLayers[layerFix[floor_id]] = L.tileLayer('https://tiles{s}.guildwars2.com/{continent}/{floor}/{z}/{x}/{y}.jpg', {
                attribution: attribution,
                minZoom: 2,
                maxZoom: 7,
                continuousWorld: true,
                subdomains: [1, 2, 3, 4 ],
                floor: floor_id,
                continent: selectedContinent
                //detectRetina: true
            });
        });
        var overlayLayers = {};
        overlayLayers['Regions'] = L.layerGroup();
        overlayLayers['Zones'] = L.layerGroup();
        overlayLayers['Sectors'] = L.layerGroup();
        overlayLayers['Points of Interest'] = L.layerGroup();
        overlayLayers['Hearts'] = L.layerGroup();
        overlayLayers['Skill Challenges'] = L.layerGroup();
        overlayLayers['Waypoints'] = L.layerGroup();
        overlayLayers['Vistas'] = L.layerGroup();
        overlayLayers['Dungeons'] = L.layerGroup();

        var map = L.map('map', {
            crs: L.CRS.Simple,
            layers: [baseLayers[startFloor]]
        });

        L.control.layers(baseLayers, overlayLayers).addTo(map);
        var boundaries = new L.LatLngBounds(map.unproject([0, 32768], map.getMaxZoom()), map.unproject([32768, 0], map.getMaxZoom()));
        map.setView(map.unproject([32768/2, 32768/2], map.getMaxZoom()), 3);
        map.setMaxBounds(boundaries);

        //Draw Regions
        files.done(function(files) {
            var poiIcon = L.icon({
                iconUrl: 'https://render.guildwars2.com/file/'+files.map_poi.signature+'/'+files.map_poi.file_id+'.png',
                iconSize: [24, 24]
            });
            var heartIcon = L.icon({
                iconUrl: 'https://render.guildwars2.com/file/'+files.map_heart_full.signature+'/'+files.map_heart_full.file_id+'.png',
                iconSize: [24, 24]
            });
            var skillIcon = L.icon({
                iconUrl: 'http://wiki.guildwars2.com/images/8/84/Skill_point.png',
                iconSize: [24, 24]
            });
            var waypointIcon = L.icon({
                iconUrl: 'https://render.guildwars2.com/file/'+files.map_waypoint.signature+'/'+files.map_waypoint.file_id+'.png',
                iconSize: [24, 24]
            });
            var vistaIcon = L.icon({
                iconUrl: 'http://wiki.guildwars2.com/images/d/d9/Vista.png',
                iconSize: [24, 24]
            });
            var dungeonIcon = L.icon({
                iconUrl: 'https://render.guildwars2.com/file/'+files.map_dungeon.signature+'/'+files.map_dungeon.file_id+'.png',
                iconSize: [24, 24]
            });

            var mapGradient = new Rainbow();
            mapGradient.setSpectrum('00ff00', 'yellow', 'red');

            floor.done(function(floors) {
                $.each(floors.regions, function(id, region) {
                    var icon = L.divIcon({html:region.name, iconSize: L.point(75, 10)});
                    L.marker(map.unproject(region.label_coord, map.getMaxZoom()), {
                        icon: icon
                    }).addTo(overlayLayers['Regions']);

                    $.each(region.maps, function(id, zone) {
                        if(falseMaps.indexOf(parseInt(id)) === -1) {
                            var xCoord = (zone.continent_rect[0][0]+zone.continent_rect[1][0]) / 2;
                            var yCoord = (zone.continent_rect[0][1]+zone.continent_rect[1][1]) / 2;
                            var mapText = zone.name + (zone.min_level === 0 ? '' : ' (' + zone.min_level + '-' + zone.max_level + ')');
                            mapGradient.setNumberRange(0, 80);
                            var icon = L.divIcon({html: '<span style="color: #' + mapGradient.colorAt(zone.min_level == 0 ? 0 : (zone.max_level + zone.max_level) / 2) + ';">' + mapText + '</span>', iconSize: [(zone.min_level === 0 ? 75 : 125), 10]});
                            L.marker(map.unproject([xCoord, yCoord], map.getMaxZoom()), {
                                icon: icon
                            }).addTo(overlayLayers['Zones']);

                            $.each(zone.sectors, function(index, sector) {
                                mapGradient.setNumberRange(zone.min_level == zone.max_level ? zone.min_level - 1 : zone.min_level, zone.max_level);
                                var sectorText = sector.name + (sector.level === 0 ? '' : ' (' + sector.level + ')');
                                var icon = L.divIcon({html: '<span style="color: #' + mapGradient.colorAt(sector.level) + ';">' + sectorText + '</span>', iconSize: L.point((zone.min_level === 0 ? 75 : 125), 10)});
                                L.marker(map.unproject(sector.coord, map.getMaxZoom()), {
                                    icon: icon
                                }).addTo(overlayLayers['Sectors']);
                            });

                            $.each(zone.points_of_interest, function(index, point_of_interest) {
                                if(falseDungeons.indexOf(point_of_interest.poi_id) === -1) {
                                    var icon;
                                    var addTo;
                                    switch(point_of_interest.type) {
                                        case 'waypoint':
                                            icon = waypointIcon;
                                            addTo = overlayLayers['Waypoints'];
                                            break;
                                        case 'vista':
                                            icon = vistaIcon;
                                            addTo = overlayLayers['Vistas'];
                                            break;
                                        case 'unlock':
                                            icon = dungeonIcon;
                                            addTo = overlayLayers['Dungeons'];
                                            break;
                                        case 'landmark':
                                            icon = poiIcon;
                                            addTo = overlayLayers['Points of Interest'];
                                            break;
                                        default:
                                            icon = poiIcon;
                                            addTo = overlayLayers['Points of Interest'];
                                            break;
                                    }
                                    L.marker(map.unproject(point_of_interest.coord, map.getMaxZoom()), {
                                        icon: icon
                                    }).bindPopup(point_of_interest.name).addTo(addTo);
                                }
                            });

                            $.each(zone.tasks, function(index, task) {
                                L.marker(map.unproject(task.coord, map.getMaxZoom()), {
                                    icon: heartIcon
                                }).bindPopup(task.objective + ' (' + task.level + ')').addTo(overlayLayers['Hearts']);
                            });

                            $.each(zone.skill_challenges, function(index, skill_challenge) {
                                L.marker(map.unproject(skill_challenge.coord, map.getMaxZoom()), {
                                    icon: skillIcon
                                }).addTo(overlayLayers['Skill Challenges']);
                            });
                        }
                    });
                });
                map.addLayer(overlayLayers['Zones']);

                map.on('zoomend', function() {
                    console.log(map.getZoom());
                    var zoom = map.getZoom();
                    if(map.hasLayer(overlayLayers['Regions']) || map.hasLayer(overlayLayers['Zones']) || map.hasLayer(overlayLayers['Sectors'])) {
                        if(zoom === 2) {
                            map.addLayer(overlayLayers['Regions']);
                            map.removeLayer(overlayLayers['Zones']);
                            map.removeLayer(overlayLayers['Sectors']);
                        } else if(zoom >= 3 && zoom <= 4) {
                            map.removeLayer(overlayLayers['Regions']);
                            map.addLayer(overlayLayers['Zones']);
                            map.removeLayer(overlayLayers['Sectors']);
                        } else if(zoom >= 5) {
                            map.removeLayer(overlayLayers['Regions']);
                            map.removeLayer(overlayLayers['Zones']);
                            map.addLayer(overlayLayers['Sectors']);
                        }
                    }
                });
            });
        });
    });
})();
