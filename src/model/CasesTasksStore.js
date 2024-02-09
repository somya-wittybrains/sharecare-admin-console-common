const dParameterlessFunctionCallsWaitingForPluginToLoad = new Map(); // Keyed by function name.  Value is a promise to be fulfilled once function call completes.
let casesTasksStoreSingleton_real;
const casesTasksStoreSingleton = new Proxy(
  {
    init(sponsorStore, restStore, authStore) {
      this.sponsorStore = sponsorStore;
      this.restStore = restStore;
      this.authStore = authStore;
    }
  },
  {
    set(target, name, newValue) {
      if (casesTasksStoreSingleton_real) {
        // If the cases & tasks plugin is already loaded, casesTasksStoreSingleton_real is set to the instance of the _real_ CasesTasksStore.
        casesTasksStoreSingleton_real[name] = newValue;
      } else {
        target[name] = newValue;
      }
      return true;
    },
    get(target, name) {
      if (casesTasksStoreSingleton_real) {
        // If the cases & tasks plugin is already loaded, casesTasksStoreSingleton_real is set to the instance of the _real_ CasesTasksStore.
        return casesTasksStoreSingleton_real[name];
      }
      if (name in target) {
        return target[name];
      }
      if (name === 'getAdvocates' || name === 'getCasesTasksFields') {
        let rv = dParameterlessFunctionCallsWaitingForPluginToLoad.get(name);
        if (!rv) {
          const o = {};
          rv = new Promise((resolve, reject) => {
            o.res = resolve;
            o.rej = reject;
          }); // Later, once the cases & tasks plugin finishes loading, we actually call these functions and resolve/reject the corresponding promises.
          rv.res = o.res;
          rv.rej = o.rej;
          dParameterlessFunctionCallsWaitingForPluginToLoad.set(name, rv);
        }
        return () => rv;
      }
      // eslint-disable-line no-unused-expressions  
        //window.CasesAndTasksPlugin
        //.observables.loaded; // Ensures that once the cases & tasks plugin has loaded, any observable value that received a dummy value from the CasesTasksStore stub, will recalculate to obtain the real value.
      if (name === 'cases' || name === 'tasks') {
        return [];
      }
      return 0;
    }
  }
);
export default casesTasksStoreSingleton;

export function CasesAndTasksPluginLoaded() {
  // vvv Note:  If cases & tasks plugin loads _before_ the following call, we would have a sequencing error.  However, I'm not sure that's even possible.
  const o = new window.CasesAndTasksPlugin.CasesTasksStore_real(
    casesTasksStoreSingleton.sponsorStore,
    casesTasksStoreSingleton.restStore,
    casesTasksStoreSingleton.authStore
  );
  casesTasksStoreSingleton_real = o;
  window.casesTasksStoreSingleton_real = casesTasksStoreSingleton_real;
  dParameterlessFunctionCallsWaitingForPluginToLoad.forEach((value, key) => {
    o[key]().then(value.res).catch(value.rej);
  });
}
