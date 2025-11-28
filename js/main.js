function nodeActive(a) {

    var groupByDirection=false;
    if (config.informationPanel.groupByEdgeDirection && config.informationPanel.groupByEdgeDirection==true)      groupByDirection=true;
    
sigInst.neighbors = {};
sigInst.detail = !0;
var b = sigInst._core.graph.nodesIndex[a];
showGroups(!1);

// --- NIEUWE GROEPERING PER RELATIETYPE (ONGEWIJZIGD) ---
var relatieBeroep = {};
var relatieOnderwijs = {};
var relatieAssociatie = {};
// --- EINDE NIEUWE GROEPERING ---

sigInst.iterEdges(function (b) {
    b.attr.lineWidth = !1;
    b.hidden = !0;
    
    var neighborID = (a == b.target) ? b.source : b.target;
    // Edge attribuut: "relatie type" wordt gebruikt om te categoriseren
    var relatieType = b.attr.attributes && b.attr.attributes["relatie type"]; 
    
    // Data die createList verwacht (edge label en edge kleur)
    var n = {
        name: b.label,
        colour: b.color
    };
    
    if (a == b.source || a == b.target) {
        // Maak de rand zichtbaar
        b.hidden = !1, b.attr.color = "rgba(0, 0, 0, 1)";
        
        // Categorie bepalen en de buur toevoegen (ID als sleutel om duplicaten te voorkomen)
        if (relatieType == "Werkgever") {
            relatieBeroep[neighborID] = n;
        } else if (relatieType == "Onderwijsinstelling") {
            relatieOnderwijs[neighborID] = n;
        } else if (relatieType == "Lid van") {
            relatieAssociatie[neighborID] = n;
        }
    }
});
// De nodes zelf worden door createList zichtbaar gemaakt.
    var f = [];
    sigInst.iterNodes(function (a) {
        a.hidden = !0;
        a.attr.lineWidth = !1;
        a.attr.color = a.color
    });
    
    // De 'groupByDirection' logica is hier verwijderd omdat deze niet compatibel is met de 
    // categorieën-logica en ongebruikte variabelen (outgoing/incoming) vereiste.
    
    var createList=function(c) {
        var f = [];
        var e = [],
                //c = sigInst.neighbors,
                g;
    for (g in c) {
        var d = sigInst._core.graph.nodesIndex[g];
        d.hidden = !1;
        d.attr.lineWidth = !1;
        d.attr.color = c[g].colour;
        a != g && e.push({
            id: g,
            name: d.label,
            group: (c[g].name)? c[g].name:"",
            colour: c[g].colour
        })
    }
    e.sort(function (a, b) {
        var c = a.group.toLowerCase(),
            d = b.group.toLowerCase(),
            e = a.name.toLowerCase(),
            f = b.name.toLowerCase();
        return c != d ? c < d ? -1 : c > d ? 1 : 0 : e < f ? -1 : e > f ? 1 : 0
    });
    d = "";
        for (g in e) {
            c = e[g];
            f.push('<li class="membership"><a href="#' + c.name + '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + c.id + '\'])\" onclick=\"nodeActive(\'' + c.id + '\')" onmouseout="sigInst.refresh()">' + c.name + "</a></li>");
        }
        return f;
    }
    
    var f = [];

// 1. Ivm Beroep
var sizeBeroep = Object.size(relatieBeroep);
f.push("<h2>Ivm Beroep (" + sizeBeroep + ")</h2>");
if (sizeBeroep > 0) {
    f = f.concat(createList(relatieBeroep));
} else {
    f.push("<li class=\"no-membership\">Geen verbindingen ivm beroep.</li>");
}

// 2. Ivm Onderwijsinstelling
var sizeOnderwijs = Object.size(relatieOnderwijs);
f.push("<h2>Ivm Onderwijsinstelling (" + sizeOnderwijs + ")</h2>");
if (sizeOnderwijs > 0) {
    f = f.concat(createList(relatieOnderwijs));
} else {
    f.push("<li class=\"no-membership\">Geen verbindingen ivm onderwijsinstelling.</li>");
}

// 3. Ivm Associatie/Vereniging
var sizeAssociatie = Object.size(relatieAssociatie);
f.push("<h2>Ivm Associatie/Vereniging (" + sizeAssociatie + ")</h2>");
if (sizeAssociatie > 0) {
    f = f.concat(createList(relatieAssociatie));
} else {
    f.push("<li class=\"no-membership\">Geen verbindingen ivm associatie/vereniging.</li>");
}

//b is object of active node -- SAH
b.hidden = !1;
b.attr.color = b.color;
b.attr.lineWidth = 6;
b.attr.strokeStyle = "#000000";
sigInst.draw(2, 2, 2, 2);

$GP.info_link.find("ul").html(f.join(""));
// FIX: De jQuery loop die hier stond, overschreef 'b' en is verwijderd.

// De variabele 'f' wordt opnieuw toegewezen om de daaropvolgende logica (voor de node-attributen) te laten werken.
f = b.attr;

if (f.attributes) {
      var image_attribute = false;
      if (config.informationPanel.imageAttribute) {
          image_attribute=config.informationPanel.imageAttribute;
      }

    var e = []; // Array voor de attribute display HTML-fragmenten
    var addedAttributes = {}; // Houd bij welke attributen al zijn toegevoegd
    
    // 1. Definieer de gewenste volgorde
    var priorityOrder = ['type', 'beroep', 'Modularity Class'];
    
    // 2. Voeg de geprioriteerde attributen toe in de gedefinieerde volgorde
    for (var i = 0; i < priorityOrder.length; i++) {
        var attrKey = priorityOrder[i];
        
        // Controleer of het attribuut bestaat in de data en niet het afbeelding-attribuut is
        if (f.attributes[attrKey] !== undefined && attrKey !== image_attribute) {
            var d = f.attributes[attrKey];
            
            // Maak de HTML string
            var h = '<span><strong>' + attrKey + ':</strong> ' + d + '</span>';
            
            e.push(h);
            addedAttributes[attrKey] = true;
        }
    }
    
    // 3. Voeg de overige attributen toe
    for (var attr in f.attributes) {
        var d = f.attributes[attr];
        
        if (!addedAttributes[attr] && attr !== image_attribute) {
            var h = '<span><strong>' + attr + ':</strong> ' + d + '</span>';
            e.push(h);
        }
    }

    // --- NIEUWE LOGICA VOOR LINKS ---
    
    // 4. Voeg de Wikidata link toe (gebruikt de node ID als Q-ID)
    var qid = b.id;
    // We gaan ervan uit dat de node ID (b.id) de Q-ID is, en de link is naar de hoofdnaamruimte
    if (qid && qid.match(/^Q[0-9]+$/i)) {
        var wikidata_url = 'https://www.wikidata.org/wiki/' + qid;
        var wikidata_html = '<span><strong>Wikidata:</strong> <a href="' + wikidata_url + '" target="_blank">Bekijk item (' + qid + ')</a></span>';
        e.push(wikidata_html);
    }
    
    // 5. Voeg de Afbeelding URL link toe
    if (image_attribute && f.attributes[image_attribute]) {
        var image_url = f.attributes[image_attribute];
        var image_link_html = '<span><strong>Afbeelding URL:</strong> <a href="' + image_url + '" target="_blank">Directe link</a></span>';
        e.push(image_link_html);
    }

    // --- EINDE NIEUWE LOGICA ---

    // De thumbnail-weergave (reeds aangepast voor max-height/width)
    if (image_attribute) {
        $GP.info_name.html("<div><img src=" + f.attributes[image_attribute] + " style=\"vertical-align:middle; max-height:60px; max-width:60px; margin-right: 10px;\" /> <span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
    } else {
        $GP.info_name.html("<div><span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
    }
    
    // Geef alle attributen en links weer, gescheiden door <br/>
    $GP.info_data.html(e.join("<br/>"))
}
$GP.info_data.show();
$GP.info_p.html("Connections:");
$GP.info.animate({width:'show'},350); // <-- Dit is de animatie die het paneel weergeeft
$GP.info_donnees.hide();
$GP.info_donnees.show();
sigInst.active = a;
window.location.hash = b.label;
}
