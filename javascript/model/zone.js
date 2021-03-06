import Immutable from 'immutable'
import ol from 'openlayers'
import Rainbow from 'rainbowvis.js'
import Rect from 'javascript/model/rect'
import Sector from 'javascript/model/sector'
import HeroPoint from 'javascript/model/heroPoint'
import Heart from 'javascript/model/heart'
import PointOfInterest from 'javascript/model/pointOfInterest'

const levelGradient = new Rainbow()
levelGradient.setSpectrum('limegreen', 'yellow', 'ff4444')
levelGradient.setNumberRange(0, 80)

export default class Zone {
  constructor(mapDef, iconUrls) {
    this.name = mapDef.get('name')
    this.minLevel = mapDef.get('min_level')
    this.maxLevel = mapDef.get('max_level')
    this.id = mapDef.get('id')
    this.defaultFloor = mapDef.get('default_floor')
    this.continentRect = new Rect(mapDef.get('continent_rect'))
    this.sectors = mapDef.get('sectors').map(sector => new Sector(sector, this.minLevel, this.maxLevel))
    this.hearts = mapDef.get('tasks').map(task => new Heart(task, iconUrls))
    this.heroPoints = mapDef.get('skill_challenges').map(sc => new HeroPoint(sc, iconUrls))
    const pois = mapDef.get('points_of_interest').valueSeq().map(poi => new PointOfInterest(poi, iconUrls)).groupBy(poi => poi.type)
    this.vistas = pois.get('vista', new Immutable.List())
    this.waypoints = pois.get('waypoint', new Immutable.List())
    this.pointsOfInterest = pois.get('poi', new Immutable.List())
    this.dungeons = pois.get('dungeon', new Immutable.List())
  }

  get displayName() {
    if(this.minLevel === 0) {
      return this.name
    } else if (this.minLevel === this.maxLevel) {
      return `${this.name} (${this.minLevel})`
    } else {
      return `${this.name} (${this.minLevel}-${this.maxLevel})`
    }
  }

  get averageLevel() {
    return (this.minLevel + this.maxLevel) / 2
  }

  get labelColor() {
    if(this.minLevel === 0) {
      return `#${levelGradient.colourAt(this.minLevel)}`
    } else {
      return `#${levelGradient.colourAt(this.averageLevel)}`
    }
  }

  get olFeature() {
    const feature = new ol.Feature({
      geometry: this.continentRect.center.olPoint,
    })
    feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
        textAlign: "center",
        textBaseline: "middle",
        font: 'italic 0.9em sans-serif',
        text: this.displayName,
        fill: new ol.style.Fill({color: this.labelColor}),
        stroke: new ol.style.Stroke({color: "#000000", width: 2}),
      }),
    }))
    return feature
  }

  static get falseZones() {
    return Immutable.Set([37, 55, 61, 77, 79, 80, 89, 92, 97, 110, 113, 120,
      138, 140, 142, 143, 144, 145, 147, 148, 149, 152, 153, 154, 157, 159, 161,
      162, 163, 171, 172, 178, 179, 180, 182, 184, 185, 186, 190, 191, 192, 193,
      195, 196, 198, 199, 201, 202, 203, 211, 212, 215, 216, 217, 222, 224, 225,
      226, 232, 234, 237, 238, 239, 242, 244, 248, 249, 250, 251, 252, 254, 255,
      256, 257, 258, 259, 260, 262, 263, 264, 267, 269, 271, 272, 274, 275, 276,
      282, 283, 284, 287, 288, 290, 294, 330, 327, 334, 363, 364, 365, 371, 372,
      373, 374, 375, 376, 378, 379, 380, 381, 382, 385, 386, 387, 388, 389, 390,
      391, 392, 393, 394, 396, 397, 399, 400, 401, 405, 407, 410, 411, 412, 413,
      414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 427, 428, 429,
      430, 434, 435, 436, 439, 440, 441, 444, 447, 449, 453, 454, 455, 458, 459,
      460, 464, 465, 466, 470, 471, 474, 476, 477, 480, 481, 483, 485, 487, 488,
      490, 492, 497, 498, 499, 502, 503, 504, 505, 507, 509, 511, 512, 513, 514,
      515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 527, 528, 529, 532,
      533, 534, 535, 536, 537, 538, 539, 540, 542, 543, 544, 545, 546, 547, 548,
      552, 556, 557, 558, 559, 560, 561, 563, 564, 567, 569, 570, 571, 573, 574,
      575, 576, 577, 578, 579, 581, 582, 583, 584, 586, 587, 588, 589, 590, 591,
      592, 594, 595, 596, 597, 598, 599, 606, 607, 608, 609, 610, 611, 613, 614,
      617, 618, 620, 621, 622, 623, 624, 625, 628, 629, 630, 631, 634, 635, 636,
      638, 642, 643, 644, 645, 648, 649, 650, 651, 652, 653, 655, 656, 657, 659,
      662, 663, 664, 666, 667, 668, 669, 670, 672, 673, 674, 675, 676, 677, 678,
      680, 681, 682, 683, 684, 685, 686, 687, 691, 692, 693, 694, 698, 700, 703,
      706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 719, 726, 727, 728, 729,
      730, 731, 732, 733, 735, 736, 737, 738, 739, 743, 744, 745, 746, 747, 750,
      751, 758, 760, 761, 762, 763, 767, 768, 769, 772, 775, 777, 778, 779, 781,
      783, 784, 785, 786, 787, 788, 790, 792, 793, 797, 799, 806, 807, 820, 821,
      825, 827, 828, 830, 833, 845, 849, 905, 914, 938, 939, 980, 989, 990, 991,
      992, 993, 994, 997, 999, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007,
      1009, 1010, 1016, 1017, 1018, 1021, 1022, 1023, 1024, 1025, 1026, 1027,
      1028, 1029, 1032, 1033, 1037, 1048, 1050, 1051, 1054, 1058, 1062, 1063,
      1064, 1065, 1066, 1067, 1069, 1070, 1071, 1072, 1073, 1074, 1076, 1079,
      1080, 1081, 1082, 1083, 1084, 1087, 1088, 1089, 1090, 1092, 1094, 1095,
      1097, 1098, 1100, 1101, 1104, 1106, 1107, 1108, 1109, 1110, 1113, 1115,
      1117, 1121, 1122, 1123, 1124, 1125, 1128, 1129, 1130, 1133, 1134, 1135,
      1136, 1137, 1139, 1140, 1142, 1144, 1146])
  }
}
