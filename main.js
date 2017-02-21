
var flux = window.Fluxiny.create();

var API = {
    state : 0,

    Status : {
        NONE    : 0,
        PENDING : 1,
        ERROR   : 2,
        SUCCESS : 4
    },

    dummy : {
        val: 0
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

    'likes.get' : function( payload ) {
        var dummy = this.dummy;
        return new Promise( function( resolve, reject ) {
            window.setTimeout( function() {
                var result = dummy.val += payload.incrementor;
                resolve( result );
            }, 1000 );
        } );
    }
};

var ApiStore = {
    promises : {},
    actions : {
        updateLikes : flux.createAction( 'update.likes' ),
        updateCounts : flux.createAction( 'update.counts' )
    },
    update : function( action, change ) {
        var actions = this.actions;

        switch ( action.type ) {
            case 'likes.get' :
                var promise = this.promises['likes.get'];
                //if ( promise && promise.isPending() ) {
                  //  return promise;
                //}
                API[ action.type ]( action.payload )
                    .then( function ( result ) {
                        actions.updateLikes( result );
                        actions.updateCounts( result );
                    } ).then( change );
                break;
        }
    }
};

var LikeStore = {
    data : 0,
    update : function( action, change ) {
        switch ( action.type ) {
            case 'update.likes' :
                this.data = action.payload;
                break;
        }
        change();
    },
    get : function () {
        return this.data;
    }
};

var CounterStore = {
    data : 0,
    update : function( action, change ) {
        switch ( action.type ) {
            case 'update.counts' :
                this.data = action.payload / 2;
                break;
        }
        change();
    },
    get : function () {
        return this.data;
    }
};
Object.defineProperty( CounterStore, 'data', {
    get : function() {
        return data;
    },
    // Immutable by the outside world
    set : function(args) {
        if ( args.length < 1 ) {
            data = args;
        }
    },
    configurable : true
} );

// ------- META

flux.createSubscriber( ApiStore )( function( store ) {
    console.info( store );
} );

// ------- VIEW

var increase   = flux.createAction('likes.get');

var CounterView = function(subscriber, increase) {
    document.querySelector('svg').addEventListener('click', function(event) {
        event.preventDefault();
        increase({ incrementor : 4 });
    });

    subscriber(function(store) {
        document.querySelector('#counter').textContent = store.get();
    } );
};
var CounterSubscriber = flux.createSubscriber(CounterStore);
CounterView(CounterSubscriber, increase);

var foobar = flux.createAction('foobar');
var MirrowView = function(subscriber, increase, foobar) {
    document.querySelector('button').addEventListener('click', function(event) {
        event.preventDefault();
        increase({ incrementor : 4 });
        foobar();
    });

    subscriber(function(store) {
        var data = store.get();
        console.info('BEFORE', data);
        data = ['asdf'];
        console.info('AFTER', data);
        // @TODO Prepare data for Mustache Template
        document.querySelector('#mirror').textContent = data;
    } );
};
var LikeSubscriber = flux.createSubscriber(LikeStore);
MirrowView(LikeSubscriber, increase, foobar);