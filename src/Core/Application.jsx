import React from 'react'
import ReactDOM from 'react-dom'

import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRedirect, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { routerReducer } from 'react-router-redux'

import createStore from './CreateStore'

class Application {
    constructor(name) {
        const _name = name
        Object.defineProperty(this, 'name', {
            enumerable: true,
            get: () => _name
        })

        const _routes = []
        Object.defineProperty(this, 'routes', {
            enumerable: false,
            get: () => _routes
        })

        const _reducers = {
            routing: routerReducer
        }
        Object.defineProperty(this, 'reducers', {
            enumerable: false,
            get: () => _reducers
        })
    }

    register(module) {
        console.log(`Registering module ${module.name}...`)

        if (module.routes) {
            this.routes.push(module.routes)
        }

        if (module.reducer) {
            this.reducers[module.name] = module.reducer
        }
    }

    onBeforeStart(callback) {
        this._beforeStart = new Promise(resolve => {
            callback(resolve)
        })
    }

    init(callback) {
        return new Promise((resolve, reject) => {
            callback(this, resolve, reject)
        })
    }

    async start(id) {
        const node = document.getElementById(id)
        if (!node) {
            throw new Error(`Node #${id} does not exist!`)
        }

        // Create the store
        const _store = createStore(combineReducers(this.reducers))
        Object.defineProperty(this, 'store', {
            enumerable: true,
            get: () => _store
        })

        // Sync history
        const _history = syncHistoryWithStore(browserHistory, _store)
		Object.defineProperty(this, 'history', {
			enumerable: false,
			get: () => _history
		})

        if (this._beforeStart) {
            try {
                await this._beforeStart
            } catch (error) {
                throw new Error(error)
            }
        }

        ReactDOM.render(
            <Provider store={this.store}>
				<Router history={this.history}>
					{this.routes.map(r => r(this.store))}
				</Router>
			</Provider>,
            node
        )
    }
}

export default Application
