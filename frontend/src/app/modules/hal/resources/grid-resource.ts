//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
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
// See doc/COPYRIGHT.rdoc for more details.
//++

import {HalResource} from 'core-app/modules/hal/resources/hal-resource';
import {GridWidgetResource} from "core-app/modules/hal/resources/grid-widget-resource";
import {
  WorkPackageBaseResource,
  WorkPackageResourceEmbedded,
  WorkPackageResourceLinks
} from "core-app/modules/hal/resources/work-package-resource";

export interface GridResourceLinks {
  update(payload:unknown):Promise<unknown>;
  updateImmediately(payload:unknown):Promise<unknown>;
  delete():Promise<unknown>;
}

export class GridResource extends HalResource {
  public widgets:GridWidgetResource[];
  public name:string;
  public options:{[key:string]:unknown};
  public rowCount:number;
  public columnCount:number;

  public $initialize(source:any) {
    super.$initialize(source);

    this.widgets = this
      .widgets
      .map((widget:Object) => new GridWidgetResource(
        this.injector,
        widget,
        true,
        this.halInitializer,
        'GridWidget'
        )
      );
  }
}

export interface GridResource extends Partial<GridResourceLinks> {
}
