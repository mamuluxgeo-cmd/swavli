(function(){
  'use strict';

  function id(x){ return document.getElementById(x); }

  function addAfter(target, node){
    if(target && target.parentNode){ target.parentNode.insertBefore(node, target.nextSibling); }
  }

  function makeGroup(label, html){
    var div = document.createElement('div');
    div.className = 'fg';
    div.innerHTML = '<label>' + label + '</label>' + html;
    return div;
  }

  function ensureSettlement(){
    if(id('settlement')) return;
    var region = id('region');
    if(!region) return;
    var group = makeGroup('ქალაქი / სოფელი <span>*</span>', '<input type="text" id="settlement" placeholder="მაგ: ბათუმი">');
    var priceGroup = id('price') && id('price').closest('.fg');
    if(priceGroup && priceGroup.parentNode){ priceGroup.parentNode.insertBefore(group, priceGroup); }
    else addAfter(region.closest('.fg'), group);
  }

  function ensurePriceType(){
    if(id('priceType')) return;
    var price = id('price');
    if(!price) return;
    var group = makeGroup('ფასის ტიპი <span>*</span>', '<select id="priceType"><option>საათში</option><option>თვეში</option><option>კურსი</option><option>შეთანხმებით</option></select>');
    addAfter(price.closest('.fg'), group);
  }

  function patchSubmit(){
    var oldSubmit = window.submitForm;
    if(typeof oldSubmit !== 'function' || oldSubmit.__patched) return;
    function patchedSubmit(){
      var settlement = id('settlement');
      var region = id('region');
      var priceType = id('priceType');
      var price = id('price');
      if(settlement && !settlement.value && region && region.value === 'თბილისი') settlement.value = 'თბილისი';
      if(priceType && priceType.value === 'შეთანხმებით' && price && !price.value) price.value = '0';
      return oldSubmit.apply(this, arguments);
    }
    patchedSubmit.__patched = true;
    window.submitForm = patchedSubmit;
  }

  function run(){ ensureSettlement(); ensurePriceType(); patchSubmit(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
