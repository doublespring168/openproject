#-- encoding: UTF-8

#-- copyright

# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
module DemoData
  class WorkPackageBoardSeeder < Seeder
    attr_accessor :project, :key

    include ::DemoData::References

    def initialize(project, key)
      self.project = project
      self.key = key
    end

    def seed_data!
      # Seed only for those projects that provide a `kanban` key, i.e. 'demo-project' in standard edition.
      if project_has_data_for?(key, 'boards.kanban')
        print '    ↳ Creating demo status board'
        seed_kanban_board
        puts
      end

      if project_has_data_for?(key, 'boards.basic')
        print '    ↳ Creating demo basic board'
        seed_basic_board
        puts
      end
    end

    private

    def seed_kanban_board
      board = ::Boards::Grid.new project: project

      board.name = project_data_for(key, 'boards.kanban.name')
      board.options = { 'type' => 'action', 'attribute' => 'status', 'highlightingMode' => 'priority' }

      board.widgets = seed_kanban_board_queries.each_with_index.map do |query, i|
        Grids::Widget.new start_row: 1, end_row: 2,
                          start_column: i + 1, end_column: i + 2,
                          options: { query_id: query.id,
                                     filters: [{ status: { operator: '=', values: query.filters[0].values } }] },
                          identifier: 'work_package_query'
      end

      board.column_count = board.widgets.count
      board.row_count = 1

      board.save!

      Setting.boards_demo_data_available = 'true'
    end

    def seed_kanban_board_queries
      admin = User.admin.first

      status_names = ['New', 'In progress', 'Closed', 'Rejected']
      statuses = Status.where(name: status_names).to_a

      if statuses.size < status_names.size
        raise StandardError.new "Not all statuses needed for seeding a KANBAN board are present. Check that they get seeded."
      end

      statuses.to_a.map do |status|
        Query.new_default(project: project, user: admin).tap do |query|
          # Hide the query
          query.hidden = true

          query.name = status.name
          # Set filter by this status
          query.add_filter('status_id', '=', [status.id])

          # Set manual sort filter
          query.sort_criteria = [[:manual_sorting, 'asc']]

          query.save!
        end
      end
    end

    def seed_basic_board
      board = ::Boards::Grid.new project: project
      board.name = project_data_for(key, 'boards.basic.name')

      board.widgets = seed_basic_board_queries.each_with_index.map do |query, i|
        Grids::Widget.new start_row: 1, end_row: 2,
                          start_column: i + 1, end_column: i + 2,
                          options: { query_id: query.id,
                                     filters: [{ manualSort: { operator: 'ow', values: [] } }] },
                          identifier: 'work_package_query'
      end

      board.column_count = board.widgets.count
      board.row_count = 1

      board.save!
    end

    def seed_basic_board_queries
      admin = User.admin.first

      lists = query_list_work_package_association

      lists.map do |list|
        Query.new(project: project, user: admin).tap do |query|
          # Hide the query
          query.hidden = true
          query.name = list[:name]

          # Set manual sort filter
          query.add_filter('manual_sort', 'ow', [])
          query.sort_criteria = [[:manual_sorting, 'asc']]

          query.ordered_work_packages = list[:wps]
          query.save!
        end
      end
    end

    def query_list_work_package_association
      wps = [
        [WorkPackage.find_by(subject: 'Plan a hiking trip').id,
         WorkPackage.find_by(subject: 'Sow flowers').id,
         WorkPackage.find_by(subject: 'Cut the lawn').id,
         WorkPackage.find_by(subject: 'Cut trees').id],
        [WorkPackage.find_by(subject: 'Visit the fire department').id],
        [WorkPackage.find_by(subject: 'Visit the ocean').id,
         WorkPackage.find_by(subject: 'Learn how to dive').id],
        [WorkPackage.find_by(subject: 'Eat more bananas').id,
         WorkPackage.find_by(subject: 'Buy a parasol').id]
      ]

      [{ name: 'Green list', wps: wps[0] },
       { name: 'Red list', wps: wps[1] },
       { name: 'Blue list', wps: wps[2] },
       { name: 'Yellow list', wps: wps[3] }]
    end
  end
end
