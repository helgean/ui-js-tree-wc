export const template = (strings, ...keys) => {
  return function(state) {
    const templateStr = keys
      .reduce((result, key, i) => {
        result.push(state[key], strings[i + 1]);
        return result;
      }, [strings[0]])
      .join('')
      .trim();
    const templateEl = new DOMParser().parseFromString(`<template>${templateStr}</template>`, 'text/html').querySelector('template');
    const clone = () => templateEl.content.cloneNode(true);
    return {
      html: templateStr,
      element: templateEl,
      clone: clone,
      render: (parent) => parent.replaceChildren(clone())
    };
  }
};

export const renderList = (listEl, itemTpl, collection) => {
  const list = collection.map(item => itemTpl(item).clone());
  listEl.replaceChildren(...list);
};