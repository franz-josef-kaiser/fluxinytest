
var flux = window.Fluxiny.create();

var API = {
    state : 0,

    Status : {
        NONE    : 0,
        PENDING : 1,
        ERROR   : 2,
        SUCCESS : 4
    },

    promises : {},

    // (A) Return new Promise
    //     return new Promise(...
    // (B) Return curr Promise === Single event, should be handled in the UI (disable)
    //     if ( promise && promise.isPending() ) { return promise; }
    // (C) Cancellation
    //     if ( promise && promise.isPending() ) { promise.cancel(); }
    //     return new Promise(...

    'user.login' : function() {
        // B
    },

    'user.logout' : function() {
        // B
    },

    'user.get' : function() {
        // B
    },

    'user.register' : function() {
        // B
    },

    'user.update' : function() {
        // C
    },

    'users.search' : function() {
        // C
    },

    'comment.add' : function() {
        // B
    },

    'comments.get' : function() {
        // B
    },

    'inspiration.get' : function() {
        // A
    },

    'project.get' : function() {
        // C
    },

    'project.get.meta' : function() {
        // C
    },

    'like.add' : function() {
        // A (zB Swipe)
    },

    'like.remove' : function() {
        // A (zB Swipe)
    },

    'likes.get' : function( val, incrementor ) {

        var promise = new Promise( function( resolve, reject ) {
            window.setTimeout( function() {
                var result = val + incrementor;
                resolve( result );
            }, 1000 );
        } );
        if ( 'undefined' === typeof this.promises['likes.get'] ) {
            this.promises['likes.get'] = promise;
        }
        return promise;
    },

    'foobar' : function( id ) {
        console.info('foobar');
        var promise = new Promise( function( resolve, reject ) {
            window.setTimeout( function() {
                resolve( "evil" );
            }, 0 );
        } );
        return promise;
    }
};

var ApiStore = {
    promises : {},
    data: {
        val: 0
    },
    actions : {
        updateLikes : flux.createAction('update.likes')
    },
    update : function( action, change ) {
        var data = this.data;
        var actions = this.actions;

        switch ( action.type ) {
            case 'likes.get' :
                var promise = this.promises['likes.get'];
                //if ( promise && promise.isPending() ) {
                  //  return promise;
                //}
                API[ action.type ]( data.val, action.payload.incrementor )
                    .then( function ( result ) {
                        data.val = result;
                        actions.updateLikes(result);
                        change();
                    } );
                break;
        }
    }
};

var ApiSubscriber = flux.createSubscriber(ApiStore);
ApiSubscriber(function(store) { console.info('you know nothing', store); });


var LikeStore = {
    data : {
        val : 0
    },
    update : function( action, change ) {
        switch ( action.type ) {
            case 'update.likes' :
                this.data.val = action.payload;
                break;
        }
        change()
    },
    get : function () {
        return this.data.val;
    }
};

var CounterStore = {
    data : {
        val : 0
    },
    update : function( action, change ) {
        switch ( action.type ) {
            case 'update.likes' :
                this.data.val = action.payload / 2;
                break;
        }
        change()
    },
    get : function () {
        return this.data.val;
    }
};

var CounterView = function(subscriber, increase) {
    document.querySelector('svg').addEventListener('click', function(event) {
        event.preventDefault();
        increase({ incrementor : 4 });
    });

    subscriber(function(store) {
        document.querySelector('#counter').textContent = store.get();
    } );
};

var MirrowView = function(subscriber, increase, foobar) {
    document.querySelector('button').addEventListener('click', function(event) {
        event.preventDefault();
        increase({ incrementor : 4 });
        foobar();
    });

    subscriber(function(store) {
        document.querySelector('#mirror').textContent = store.get();
    } );
};

var Likesubscriber    = flux.createSubscriber(LikeStore);
var Countersubscriber = flux.createSubscriber(CounterStore);
var increase   = flux.createAction('likes.get');
var foobar     = flux.createAction('foobar');

CounterView(Likesubscriber, increase);
MirrowView(Countersubscriber, increase, foobar);