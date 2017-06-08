import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Discover Controller
 *
 * Most of the discover page is built using the discover-page component in ember-osf. The component is largely based on
 * SHARE's discover interface (https://github.com/CenterForOpenScience/ember-share/blob/develop/app/controllers/discover.js) and
 * the existing preprints interface
 */

export default Ember.Controller.extend(Analytics, {
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(),
    activeFilters: { providers: [], subjects: [] },
    additionalProviders: Ember.computed('themeProvider', function() { // Pulls additionalProviders array off of preprint provider
        return this.get('themeProvider.additionalProviders') || [];
    }),
    consumingService: 'preprints', // Consuming service - preprints here
    detailRoute: 'content', // Name of detail route for this application
    discoverHeader: Ember.computed('i18n', 'additionalProviders', function() { // Header for preprints discover page
        return this.get('additionalProviders') ? this.get('i18n').t('discover.search.heading_repository_search') : this.get('i18n').t('discover.search.heading');
    }),
    facets: Ember.computed('i18n.locale', 'additionalProviders', function() { // List of facets available for preprints
        const additionalProviders = this.get('additionalProviders');
        if (additionalProviders.length) {
            return [
                { key: 'sources', title: this.get('i18n').t('discover.main.source'), component: 'search-facet-source'},
                { key: 'date', title: this.get('i18n').t('discover.main.date'), component: 'search-facet-daterange'},
                { key: 'type', title: this.get('i18n').t('discover.main.type'), component: 'search-facet-worktype'},
                { key: 'tags', title: this.get('i18n').t('discover.main.tag'), component: 'search-facet-typeahead'},
            ];
        } else {
            return [
                { key: 'sources', title: `${this.get('i18n').t('discover.main.providers')}`, component: 'search-facet-provider' },
                { key: 'subjects', title: `${this.get('i18n').t('discover.main.subject')}`, component: 'search-facet-taxonomy' }
            ]
        }
    }),
    filterMap: { // Map active filters to facet names expected by SHARE
        providers: 'sources',
        subjects: 'subjects'
    },
    filterReplace: { // Map filter names for front-end display
        'Open Science Framework': 'OSF',
        'Cognitive Sciences ePrint Archive': 'Cogprints',
        OSF: 'OSF Preprints',
        'Research Papers in Economics': 'RePEc'
    },
    lockedParams: Ember.computed('additionalProviders', function() {
        if (this.get('additionalProviders').length) {
            return {};
        } else {
            return {types: 'preprint'};
        }

    }), // Parameter names which cannot be changed
    page: 1, // Page query param. Must be passed to component, so can be reflected in URL
    provider: '', // Provider query param. Must be passed to component, so can be reflected in URL
    q: '', // q query param.  Must be passed to component, so can be reflected in URL
    queryParams: ['page', 'q', 'subject', 'provider'], // Pass in the list of queryParams for this component
    searchPlaceholder: Ember.computed('i18n', function() { // Search bar placeholder
        return this.get('i18n').t('discover.search.placeholder');
    }),
    showActiveFilters: Ember.computed('additionalProviders', function() {  // Whether Active Filters should be displayed.
        const additionalProviders = this.get('additionalProviders');
        return additionalProviders.length ? false: true;
    }),
    sortOptions: Ember.computed('i18n.locale', function() { // Sort options for preprints
        const i18n = this.get('i18n');
        return [{
            display: i18n.t('discover.relevance'),
            sortBy: ''
        }, {
            display: i18n.t('discover.sort_oldest_newest'),
            sortBy: 'date_updated'
        }, {
            display: i18n.t('discover.sort_newest_oldest'),
            sortBy: '-date_updated'
        }];
    }),
    subject: '',// Subject query param.  Must be passed to component, so can be reflected in URL,
    themeProvider: Ember.computed('model', function() { // Pulls the preprint provider from the already loaded model
        let themeProvider = null;
        this.get('model').forEach(provider => {
            if (provider.id === this.get('theme.id')) {
                themeProvider = provider;
            }
        });
        return themeProvider;
    }),
    _clearFilters() {
        this.set('activeFilters', {
            providers: [],
            subjects: []
        });
        this.set('provider', '');
        this.set('subject', '');
    },
    _clearQueryString() {
        this.set('q', '');
    }
});
