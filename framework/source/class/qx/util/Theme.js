/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Utility to switch theme at runtime.
 */
qx.Class.define("qx.util.Theme",
{
  statics :
  {
    /**
     * Changes theme at runtime.
     * @param meta {Object} A map of theme classes
     */
    "switch" : function(meta)
    {
      // kill theme classes, because of internal chaches 
      var metaMgr = qx.theme.manager.Meta;
      var colorMgr = qx.theme.manager.Color;
      var decorationMgr = qx.theme.manager.Decoration;
      var fontMgr = qx.theme.manager.Font;
      var iconMgr = qx.theme.manager.Icon;
      var appearanceMgr = qx.theme.manager.Appearance;
      
      metaMgr = null;
      colorMgr.$$instance = colorMgr = null;
      decorationMgr.$$instance = decorationMgr = null;
      fontMgr.$$instance = fontMgr = null;
      iconMgr.$$instance = iconMgr = null;
      appearanceMgr.$$instance = appearanceMgr = null;
      
      // Reinitialize theme classes
      qx.theme.manager.Meta.getInstance().setTheme(meta);
      
      
      // Reset each created LayoutItem 
      var reg = qx.core.ObjectRegistry.getRegistry();
      for (var obj in reg) 
      {
        if (reg[obj] instanceof qx.ui.core.LayoutItem)
        {
          var widget = reg[obj];
          
          
          // Reset themed prtoperties
          this._reset(widget);
          
          // if decorator element is not removed by reset function, dispose it 
          if (widget.__decoratorElement) {
            widget.__containerElement.remove(widget.__decoratorElement);
            widget.__decoratorElement.dispose();
            widget.__decoratorElement = null;
          }
          
          
          // trigger appearance update
          if (widget.updateAppearance) {
            widget.updateAppearance();
          }
        }
      }
      
      // invalidate decorator pool. Beware of invalidation 
      // before resetting layoutItems, because resetThemed functions 
      //automatically pooling decorators.
      qx.ui.core.Widget.getDecoratorPool().invalidatePool();
      qx.ui.core.queue.Manager.flush();
    },
    
    
    /**
     * Resets and reapplies themed properties of given LayoutItem
     * @param widget {qx.ui.core.LayoutItem} Any layoutItem
     */
    _reset : function(widget)
    {
      var unstyler = qx.core.Property.$$method.resetThemed;
      var runtime = qx.core.Property.$$method.resetRuntime;
      
      for (var key in unstyler) 
      {
        // Because contentPadding just forwards value to layoutParent padding
        // and we are not itereting objects hierarchicly, we have to filter that 
        // property  
        if (key.indexOf("contentPadding") != -1){
          continue;
        }
        
        // Reset runtime value
        if (widget[runtime[key]]){
          widget[runtime[key]]();
        }
        
        //apply reset function
        if (widget[unstyler[key]]){
          widget[unstyler[key]]();
        }
        
        
        // reapply user defined properties, if not decorator
        if (widget["$$user_" + key] && key != "decorator")
        {
          
          
          var applyFunc = qx.lang.String.camelCase("_apply-" + key);
          var value =  widget["$$user_" + key];
          
          if(widget[applyFunc] && value !== undefined) {
            widget[applyFunc](value);
          }
        }
      }
      
      if(widget.$$refreshInheritables) {
        widget.$$refreshInheritables();
      }
      
      if (widget instanceof qx.ui.table.Table) {
        widget.updateContent();
      }
    }
  }
});
