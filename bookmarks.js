

var set_bookmarks = (data) => {
  marks = data;
  return true;
};


var get_topic_title = (id) => {
  return id_topics[id];
};


var add_id_topic = (id, title) => {
  id_topics[id] = title;
};


var parse_url = (url) => {
  if (url) {
    if (url.match(/^https?\:\/\//) ){
      var new_url = new URL(  "https://" + url.replace(/https?\:\/\//, "" ).replace(/www\./, "") );
      return { href: new_url.href, hostname: new_url.hostname, };
    } else {
      return { href: url, hostname: "" };
    }
  } else {
    return { href: url, hostname: "" };
  }
}


var flatten_array = (data) => {
  var flat = [];
  if ( data.length > 1) {
    data.forEach( function( node ){
      if ( node.length > 1) {
        flat = flat.concat( flatten_array(node));
      } else {
        flat = flat.concat( node );
      }
    });
  } else {
    flat = flat.concat( node );
  }
  return flat;
}


var parse_tree_node = (node) => {

  var bookmark_arr = [];
  var bookmark_url = parse_url(node.url);
  var bookmark_topic = get_topic_title(node.parentId);

  var bookmark_obj = {
    url: bookmark_url.href,
    hostname: bookmark_url.hostname,
    title: node.title,
    parent: node.parentId,
    topics: bookmark_topic,
    id: node.id,
  };

  if (node.children) {

    add_id_topic( node.id, node.title );

    for (child_node of node.children){
       bookmark_arr.push( parse_tree_node(child_node));
    }

  } else {
    return bookmark_obj;
  }

  return bookmark_arr;
};



var bookmark_walker = (tree) => {
  var bookmarks = [];
  if ( tree[0].children ) {
    for ( node of tree[0].children) {
       bookmarks.push( parse_tree_node(node));
    }
  }

  set_bookmarks(bookmarks);
  flat = flatten_array(bookmarks);
  flat = flatten_array(flat);

  sorted = flat.sort(function(a, b){
    return a.url.localeCompare(b.url);
  });

  console.log("ready");
  console.log( id_topics );
  load_bookmark_table(sorted);
  return true;
};


function load_bookmark_table(data) {

  var bookmark_table = $("#bookmark_table")
  bookmark_table.DataTable ({
    "data" : data,
    "columns" : [
        { "data" : "hostname"  , "name" : "hostname" , "orderable": true , "searchable": true     , "width": "19%"   },
        { "data" : "title"     , "name" : "title"    , "orderable": true,  "searchable": true     , "width": "39%"   },
        { "data" : "url"       , "name" : "url"      , "orderable": false, "searchable": false    , "width": "39%"   },
        // { "data" : "id"        , "name" : "id"       , "orderable": false, "searchable": false    , "width": "10%"   },
        { "data" : "topics"    , "name" : "topics"   , "orderable": false, "searchable": true    , "width": "9%"   }
      ],
    "paging": true,
    "searching": true,
    "searchPane":  {
        threshold: 0.8
    },
    "autoWidth": true,
    "deferRender": false,
    buttons: [
      'copy', 'excel', 'pdf'
    ]
  } );
}


var flat = [];
var sorted = [];
var id_topics = {};
var marks;


document.addEventListener('DOMContentLoaded', function () {
  chrome.bookmarks.getTree( bookmark_walker );
});
