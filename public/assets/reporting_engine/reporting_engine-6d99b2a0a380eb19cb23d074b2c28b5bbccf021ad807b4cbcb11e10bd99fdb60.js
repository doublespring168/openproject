//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

/*jslint white: false, nomen: true, devel: true, on: true, debug: false, evil: true, onevar: false, browser: true, white: false, indent: 2 */
/*global window, $, $$, Reporting, Element */


window.Reporting = (function($) {
  var onload = function (func) {
    $(document).ready(func);
  };

  var flash = function (string, type) {
    if (!type) {
      type = "error";
    }

    var options = {};

    if (type === 'error') {
      options = {
        id: 'errorExplanation',
        class: 'errorExplanation'
      };
    }
    else {
      options = {
        id: 'flash_' + type,
        class: 'flash ' + type
      };
    }

    $("#" + options.id).remove();

    var flash = $('<div></div>')
                .attr('id', options.id)
                .attr('class', options.class)
                .attr('tabindex', 0)
                .attr('role', 'alert')
                .html(string);

    $('#content').prepend(flash);
    $('#' + options.id).focus();
  };

  var clearFlash = function () {
    $('div[id^=flash]').remove();
  };

  var fireEvent = function (element, event) {
    var evt;
    if (document.createEventObject) {
      // dispatch for IE
      evt = document.createEventObject();
      return element.fireEvent('on' + event, evt);
    } else {
      // dispatch for firefox + others
      evt = document.createEvent("HTMLEvents");
      evt.initEvent(event, true, true); // event type,bubbling,cancelable
      return !element.dispatchEvent(evt);
    }
  };

  return {
    fireEvent: fireEvent,
    clearFlash: clearFlash,
    flash: flash,
    onload: onload
  };
})(jQuery);
//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

/*jslint white: false, nomen: true, devel: true, on: true, debug: false, evil: true, onevar: false, browser: true, white: false, indent: 2 */
/*global window, $, $$, Reporting, */


Reporting.Filters = function($){
  var load_available_values_for_filter = function  (filter_name, callback_func) {
    var select, radio_options, post_select_values;
    select = $('.filter-value[data-filter-name="' + filter_name + '"]').first();
    // check if we might have a radio-box
    radio_options = $('.' + filter_name + '_radio_option input');
    if (radio_options && radio_options.length !== 0) {
      radio_options.first().checked = true;
      callback_func();
    }
    if (!select.length) {
      return;
    }
    if (select.attr('data-loading') === "ajax" && select.children().length === 0) {
      load_available_values_for_filter_from_remote(select, filter_name, callback_func);
      multi_select(select, false);
    } else {
      callback_func();
    }
  };

  var load_available_values_for_filter_from_remote = function(select, filter_name, callback_func) {
    var url = select.attr("data-remote-url"),
        json_post_select_values = select.attr('data-initially-selected'),
        post_select_values;

    if (json_post_select_values !== null && json_post_select_values !== undefined) {
      post_select_values = $.parseJSON(json_post_select_values.replace(/'/g, '"'));
    }

    if (window.global_prefix === undefined) {
      window.global_prefix = "";
    }

    $.ajax({
      url: url,
      method: 'POST',
      data: {
        filter_name: filter_name,
        values: json_post_select_values
      },
      beforeSend: function () {
        $("select[data-filter-name='" + filter_name + "']").attr('disable', true);
        $('#ajax-indicator').show();
      },
      complete: function (xhr) {
        var tagName = select.prop('tagName');

        select.html(xhr.responseText);
        $("select[data-filter-name='" + filter_name + "']").removeAttr('disable');
        if (tagName && tagName.toLowerCase() === "select") {
          if (!post_select_values || post_select_values.length === 0) {
            select.selectedIndex = 0;
          } else {
            select_values(select, post_select_values);
          }
        }
        callback_func();
      }
    });
  };

  var show_filter = function (field, options) {
    var default_options = {
      callback_func: function () {},
      slowly: false,
      show_filter: true,
      hide_only: false
    };

    options = $.extend({}, default_options, options);

    var field_el = $('#filter_' +  field);
    if (field_el !== null) {
      if (!options.insert_after) {
        options.insert_after = last_visible_filter();
      }
      if (options.insert_after && options.show_filter) {
        // Move the filter down to appear after the last currently visible filter
        if (field_el.attr('id') !== options.insert_after.id) {
          field_el.detach();
          $('#' + options.insert_after.id).after(field_el);
        }
      }
      // the following command might be included into the callback_function (which is called after the ajax request) later
      var display_functor;
      if (options.show_filter) {
        options.slowly ? field_el.fadeIn('slow') : field_el.show();
        load_available_values_for_filter(field, options.callback_func);
        $('#rm_' + field).val(field); // set the value, so the serialized form will return this filter
        value_changed(field);
      } else {
        options.slowly ? field_el.fadeOut('slow') : field_el.hide();

        if (!options.hide_only) { // remember that this filter used to be selected
          field_el.removeAttr('data-selected');
        }
        $('#rm_' + field).val(""); // reset the value, so the serialized form will not return this filter
      }
      operator_changed(field, $("#operators\\[" + field + "\\]"));
      display_category($('#' + field_el.attr("data-label")));
    }
  };

  /**
   * Activates the filter with the given name.
   *
   * @param filter_name Name of the filter to be activated.
   */
  var add_filter = function (filter_name) {
    var field = filter_name;
    // do this immediately instead of in callback to avoid concurrency issues during testing
    select_option_enabled($('#add_filter_select'), filter_name, false);
    show_filter(field, { slowly: true });
  };

  var remove_filter = function (field, hide_only) {
    show_filter(field, { show_filter: false, hide_only: hide_only });
    select_option_enabled($("#add_filter_select"), field, true);
  };

  var last_visible_filter = function () {
    return $('.advanced-filters--filter:visible').last()[0];
  };

  /* Display the given category if any of its filters are visible. Otherwise hide it */
  var display_category = function (label) {
    if (label.length) {
      $('.advanced-filters--filter').each(function() {
        var filter = $(this);
        if (filter.is(':visible') && filter.attr("data-label") === label) {
          $(label).show();
          return;
        }
        $(label).hide();
      });
    }
  };

  var operator_changed = function (field, select) {
    var option_tag, arity, first;
    if (select === null) {
      return;
    }
    first = false;
    if (!select.attr("data-first")) {
      first = true;
      $(select).attr("data-first", "false");
    }
    option_tag = select.find('option[value="' + select.val() + '"]');
    arity = parseInt(option_tag.attr("data-arity"));
    change_argument_visibility(field, arity);
    if (option_tag.attr("data-forced")) {
      force_type(option_tag, first);
    }
  };

  // Overwrite to customize input enforcements.
  // option: 'option' HTMLElement
  // first: Boolean indicating whether the operator changed for the first time
  var force_type = function (option, first) {
    return true;
  };

  var value_changed = function (field) {
    var val, filter;
    val = $('#' + field + '_arg_1_val');
    filter = $('#filter_' + field);
    if (!val) {
      return;
    }
    if (val.value === '<<inactive>>') {
      filter.addClass('inactive-filter');
    } else {
      filter.removeClass('inactive-filter');
    }
  };

  var change_argument_visibility = function (field, arg_nr) {
    var params, i;
    params = [$('#' + field + '_arg_1'), $('#' + field + '_arg_2')];

    for (i = 0; i < 2; i += 1) {
      if (params[i] !== null) {
        if (arg_nr >= (i + 1) || arg_nr <= (-1 - i)) {
          params[i].show();
          params[i].children().show();
        } else {
          params[i].hide();
          params[i].children().hide();
        }
      }
    }
  };

  var select_option_enabled = function (box, value, state) {
    box.find("[value='" + value + "']").attr('disabled', !state);
  };

  var multi_select = function (select, multi) {
    select.attr('multiple', multi);
    if (multi) {
      select.attr('size', 4);
      // deselect first option if it's present
      if (select.find('option')[0]) {
        select.find('option').first().attr('selected', false);
      }
    } else {
      select.attr('size', 1);
    }
  };

  var toggle_multi_select = function (select) {
    multi_select(select, !select.attr('multiple'));
  };

  var visible_filters = function () {
    return _.map($("#filter_table .advanced-filters--filter:visible"), function(filter) {
      return $(filter).attr("data-filter-name");
    });
  };

  var clear = function () {
    _.each(visible_filters(), function (filter) {
      remove_filter(filter);
    });
  };

  // Select the given values of the selectBox.
  // Toggle multi-select state of the selectBox depending on how many values were given.
  var select_values = function(selectBox, values_to_select) {
    multi_select(selectBox, values_to_select.length > 1);
    selectBox.val(values_to_select);
  };

  var exists = function (filter) {
    return visible_filters().indexOf(filter) > 0;
  };

  return {
    add_filter: add_filter,
    clear: clear,
    exists: exists,
    operator_changed: operator_changed,
    remove_filter: remove_filter,
    select_option_enabled: select_option_enabled,
    select_values: select_values,
    toggle_multi_select: toggle_multi_select,
    value_changed: value_changed
  };
}(jQuery);

(function($) {
  Reporting.onload(function () {
    if ($("#add_filter_select")) {
      $("#add_filter_select").on("change", function () {
        if (!(Reporting.Filters.exists(this.value))) {
          Reporting.Filters.add_filter(this.value);
          var new_filter = this.value;
          this.selectedIndex = 0;
          setTimeout(function () {
            $('#operators\\['+ new_filter +'\\]').focus();
          }, 300);
        }
      });
    }

    $(".filter_rem")
      .on("click", function (event) {
        event.preventDefault();
        var filter_name = $(this).closest('li').attr("data-filter-name");
        Reporting.Filters.remove_filter(filter_name);
      })
      .on("keydown", function (event) {
        if (event.keyCode == 13 || event.keyCode == 32) {
          event.preventDefault();
          var filter_name = $(this).closest('li').attr("data-filter-name"),
              prevVisibleFilter = $(this).closest('li').prevAll(':visible').last().find('.advanced-filters--select');

          if (prevVisibleFilter.length > 0) {
            prevVisibleFilter.focus();
          } else {
            $('#filters > legend a')[0].focus();
          }
          Reporting.Filters.remove_filter(filter_name);
        }
      });

    $(".filter_operator")
      .on("change", function (evt) {
        var filter_name = $(this).attr("data-filter-name");
        Reporting.Filters.operator_changed(filter_name, $(this));
        Reporting.fireEvent($('#' + filter_name + "_arg_1_val")[0], "change");
      });

    $(".filter_multi-select")
      .on("click", function () {
        var filter_name = $(this).attr("data-filter-name");
        Reporting.Filters.toggle_multi_select($('#' + filter_name + '_arg_1_val'));
      });

    $(".advanced-filters--filter-value .filter-value").each(function () {
      var select = $(this);
          select_value = select.val();

      select.attr('multiple', select_value && select_value.length > 1);

      select.on("change", function (evt) {
        var filter_name = $(this).closest('li').attr("data-filter-name");
        Reporting.Filters.value_changed(filter_name);
      });
    });
  });
})(jQuery);
//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

/*jslint white: false, nomen: true, devel: true, on: true, debug: false, evil: true, onevar: false, browser: true, white: false, indent: 2 */
/*global window, $, $$, Reporting, Effect, Ajax, selectAllOptions, moveOptions, moveOptionUp, moveOptionDown */


Reporting.GroupBys = (function($){
  var group_by_container_ids = function() {
    var ids = ['group-by--columns', 'group-by--rows'];

    return _.filter(ids, function (i) {
      return $('#' + i).length > 0 ;
    });
  };

  var recreate_sortables = function() {
    var containers = $('.group-by--selected-elements')
                     .toArray();

    dragula(containers,
            {
              // Setting the mirrorContainer to something smaller than the body
              // reduces the performance hit when using dnd.
              mirrorContainer: document.getElementById('group-by--area')
            });
  };

  var initialize_drag_and_drop_areas = function() {
    recreate_sortables();
  };

  var create_label = function(group_by, text) {
    return $('<label></label>')
           .attr('class', 'in_row group-by--label')
           .attr('for', group_by.attr('id'))
           .attr('id', group_by.attr('id') + '_label')
           .html(text);
  };

  var create_remove_button = function(group_by) {
    var remove_link, remove_icon;

    remove_link = $('<a></a>');
    remove_link.attr('class', 'group-by--remove in_row');
    remove_link.attr('id', group_by.attr('id') + '_remove');
    remove_link.attr('href', '');

    remove_icon = $('<span><span>');
    remove_icon.attr('class', 'icon-context icon-close icon4');

    remove_link.attr('title', I18n.t("js.reporting_engine.label_remove") + ' ' + group_by.find('label').html());
    remove_icon.attr('alt', I18n.t("js.reporting_engine.label_remove") + ' ' + group_by.find('label').html());

    remove_link.on('click', function(e) {
      e.preventDefault();
      remove_element_event_action(e, group_by, remove_link);
    });
    remove_link.on('keypress', function(e) {
      /* keyCode 32: Space */
      if (e.keyCode == 32) {
        e.preventDefault();
        remove_element_event_action(e, group_by, remove_link);
      }
    });
    remove_link.append(remove_icon);
    return remove_link;
  };

  var remove_element_event_action = function(event, group_by, button) {
      var link_node = group_by.next('span').find('a'),
          select_node = group_by.next('select');

      if (link_node.length) {
        link_node.focus();
      }
      else if (select_node.length) {
        select_node.focus();
      }

      remove_group_by(button.closest('.group-by--selected-element'));
  };

  var create_group_by = function(field, caption) {
    var group_by, label, right_arrow, left_arrow, remove_button;
    group_by = $('<span></span>');
    group_by.attr('class', 'group-by--selected-element');
    group_by.attr('data-group-by', field);
    group_by.uniqueId(); // give it a unique id

    label = create_label(group_by, caption);
    group_by.append(label);

    remove_button = create_remove_button(group_by);
    group_by.append(remove_button);

    return group_by;
  };

  // This is whether it is possible to add a new group if <<field>> through the
  // add-group-by select-box or not.
  var adding_group_by_enabled = function(field, state) {
    _.each(['#group-by--add-columns', '#group-by--add-rows'], function(container_id) {
      Reporting.Filters.select_option_enabled($(container_id), field, state);
    });
  };

  var remove_group_by = function(group_by) {
    adding_group_by_enabled(group_by.attr('data-group-by'), true);
    group_by.remove();
  };

  var add_group_by_from_select = function(select) {
    var jselect = $(select),
        field = jselect.val(),
        container = jselect.closest('.group-by--container'),
        selected_option = jselect.find("[value='" + field + "']").first(),
        caption = selected_option.attr('data-label');

    Reporting.GroupBys.add_group_by(field, caption, container);
    jselect.find("[value='']").first().attr('selected', true);
  };

  var add_group_by = function(field, caption, container) {
    var group_by, add_groups_select_box, added_container;
    add_groups_select_box = container.find('select').first();
    group_by = Reporting.GroupBys.create_group_by(field, caption);
    added_container = container.find('.group-by--selected-elements');
    added_container.append(group_by);
    adding_group_by_enabled(field, false);
  };

  var clear = function() {
    _.each(visible_group_bys(), function (group_by) {
      $('#' + group_by + ' .group-by--selected-element').each(function() {
        remove_group_by($(this));
      });
    });
  };

  var visible_group_bys = function() {
    var visible = _.filter(group_by_container_ids(), function (container) {
      return $('#' + container).find('[data-group-by]');
    });

    return _.flatten(visible);
  };

  var exists = function(group_by_name) {
    return _.some(visible_group_bys(), function (grp) {
      return $('#' + grp).attr('data-group-by') === group_by_name;
    });
  };

  return {
    add_group_by: add_group_by,
    add_group_by_from_select: add_group_by_from_select,
    clear: clear,
    create_group_by: create_group_by,
    exists: exists,
    group_by_container_ids: group_by_container_ids,
    initialize_drag_and_drop_areas: initialize_drag_and_drop_areas
  };

})(jQuery);

(function($) {
  Reporting.onload(function () {
    Reporting.GroupBys.initialize_drag_and_drop_areas();
    $('#group-by--add-rows, #group-by--add-columns').on('change', function () {
      if (!(Reporting.GroupBys.exists(this.value))) {
        Reporting.GroupBys.add_group_by_from_select(this);
      }
    });
  });
})(jQuery);
//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

/*jslint white: false, nomen: true, devel: true, on: true, debug: false, evil: true, onevar: false, browser: true, white: false, indent: 2 */
/*global window, $, $$, Reporting, Effect, Ajax */


Reporting.RestoreQuery = function($){

  var select_operator = function (field, operator) {
    var select, i;
    select = $("#operators_" + field);
    if (select === null) {
      return; // there is no such operator select field
    }
    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === operator) {
        select.selectedIndex = i;
        break;
      }
    }
    Reporting.Filters.operator_changed(field, select);
  };

  var disable_select_option = function (select, field) {
    for (var i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === field) {
        select.options[i].disabled = true;
        break;
      }
    }
  };

  var restore_filters = function () {
    var deps = _.each($('.advanced-filters--select.filter-value'), function(select) {
      var jselect = $(select),
          tr = jselect.closest('li');

      if (tr.visible()) {
        var filter = tr.attr('data-filter-name');
        var dependent = jselect.attr('data-dependent');

        if (filter && dependent) {
          Reporting.Filters.remove_filter(filter, false);
        }
      }
    });

    _.each($("li.advanced-filters--filter[data-selected=true]"), function (e) {
      var filter = $(e),
          select = filter.find(".advanced-filters--filter-value select");
      if (select && select.attr("data-dependent")) return;
      var filter_name = filter.attr("data-filter-name");
      Reporting.Filters.add_filter(filter_name);
    });
  };

  var restore_group_bys = function () {
    _.each(Reporting.GroupBys.group_by_container_ids(), function(id) {
      var container = $('#' + id),
          selected_containers = container.attr('data-initially-selected'),
          selected_groups;


      if (selected_containers) {
        selected_groups = $.parseJSON(selected_containers.replace(/'/g, '"'));
        _.each(selected_groups, function(group_and_label) {
          var group, label;
          group = group_and_label[0];
          label = group_and_label[1];
          Reporting.GroupBys.add_group_by(group, label, container);
        });
      }
    });
  };

  return {
    restore_group_bys: restore_group_bys,
    restore_filters: restore_filters
  };
}(jQuery);

Reporting.onload(function () {
  Reporting.RestoreQuery.restore_group_bys();
  Reporting.RestoreQuery.restore_filters();
});
//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++

/*jslint white: false, nomen: true, devel: true, on: true, debug: false, evil: true, onevar: false, browser: true, white: false, indent: 2 */
/*global window, $, $$, Reporting, Effect, Ajax, Element, selectAllOptions, Form */


Reporting.Controls = function($){
  var toggle_delete_form = function (e) {
    e.preventDefault();

    var offset = $('#query-icon-delete').offsetLeft;
    $('#delete_form').css("left", offset + "px").toggle();
  };

  var toggle_save_as_form = function (e) {
    e.preventDefault();

    var offset = $('#query-icon-save-as').offsetLeft;
    $('#save_as_form')
      .css('left',  offset + 'px')
      .toggle();
  };

  var clear_query = function (e) {
    e.preventDefault();

    Reporting.Filters.clear();
    Reporting.GroupBys.clear();
  };

  var send_settings_data = function (targetUrl, callback, failureCallback) {
    if (!failureCallback) {
      failureCallback = default_failure_callback;
    }
    Reporting.clearFlash();

    $.ajax({
      url: targetUrl,
      method: 'POST',
      data: serialize_settings_form(),
      beforeSend: function () {
        $('#ajax-indicator').show();
      },
      error: failureCallback,
      success: callback
    });
  };

  var serialize_settings_form = function() {
    var ret_str, grouping_str;
    ret_str = $('#query_form').serialize();
    grouping_str = _.reduce(['rows', 'columns'], function(grouping, type) {
      var element_map = _.map($('#group-by--' + type + ' .group-by--selected-element'), function(group_by) {
        return 'groups[' + type + '][]=' + $(group_by).attr('data-group-by');
      });

      return grouping + _.reduce(element_map, function(all_group_str, group_str) {
        return all_group_str + '&' + group_str;
      }, '');
    }, '');

    if (grouping_str.length > 0) {
      ret_str += grouping_str;
    }
    return ret_str;
  };

  var attach_settings_callback = function (element, callback) {
    if (element === null) {
      return;
    }
    failureCallback = function (response) {
      $('#result-table').html("");

      default_failure_callback(response);
    };

    element.on('click', function (e) {
      e.preventDefault();
      send_settings_data($(this).attr("data-target"), callback, failureCallback);
    });
  };

  var observe_click = function (element_id, callback) {
    $('#' + element_id).on('click', callback);
  };

  var update_result_table = function (response) {
    $('#result-table').html(response);

    window.OpenProject.pluginContext
      .valuesPromise()
      .then((context) => {
        context.bootstrap(document.getElementById('result-table'));
      });
  };

  var default_failure_callback = function (response) {
    if (response.status >= 400 && response.status < 500) {
      Reporting.flash(response.responseText);
    } else {
      Reporting.flash(I18n.t("js.reporting_engine.label_response_error"));
    }
  };

  return {
    attach_settings_callback: attach_settings_callback,
    clear_query: clear_query,
    observe_click: observe_click,
    update_result_table: update_result_table,
    toggle_delete_form: toggle_delete_form,
    toggle_save_as_form: toggle_save_as_form
  };
}(jQuery);

(function($) {
  Reporting.onload(function () {
    if ($('#query_saved_name').length) {
      // don't concern ourselves with new queries
      if ($('#query_saved_name').attr("data-is_new")) {
        if ($('#query-icon-delete').length) {
          Reporting.Controls.observe_click("query-icon-delete", Reporting.Controls.toggle_delete_form);
          Reporting.Controls.observe_click("query-icon-delete-cancel", Reporting.Controls.toggle_delete_form);
          $('#delete_form').hide();
        }

        if ($("#query-breadcrumb-save").length) {
          // When saving an update of an exisiting query or apply filters, we replace the table on success
          Reporting.Controls.attach_settings_callback($("#query-breadcrumb-save"), Reporting.Controls.update_result_table);
        }
      }
    }

    Reporting.Controls.observe_click("query-icon-save-as", Reporting.Controls.toggle_save_as_form);
    Reporting.Controls.observe_click("query-icon-save-as-cancel", Reporting.Controls.toggle_save_as_form);

    $('#save_as_form').hide();

    // When saving a new query, the success-response is the new saved query's url -> redirect to that
    Reporting.Controls.attach_settings_callback($("#query-icon-save-button"), function (newLocation) {
      document.location = newLocation;
    });
    // When saving an update of an exisiting query or apply filters, we replace the table on success
    Reporting.Controls.attach_settings_callback($("#query-icon-apply-button"), Reporting.Controls.update_result_table);
    Reporting.Controls.observe_click('query-link-clear', Reporting.Controls.clear_query);
  });
})(jQuery);
//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2020 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2017 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See docs/COPYRIGHT.rdoc for more details.
//++






;
