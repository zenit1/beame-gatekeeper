/**
 * Created by zenit1 on 14/05/2017.
 */

function loadGkLogins() {
	$("#login-grid").kendoGrid({
		toolbar:    ["create"],
		dataSource: {
			transport: {
				read:    {
					url: "/login/list"
				},
				create:  {
					url:      "/login/create",
					method:   "POST",
					dataType: "json"
				},
				update:  {
					url:      "/login/update",
					method:   "POST",
					dataType: "json"
				},
				destroy: {
					url:      "/login/destroy",
					method:   "POST",
					dataType: "json"
				}
			},
			schema:    {
				model: {
					id:     "id",
					fields: {
						id:       {type: "number", "editable": false},
						fqdn:     {type: "string",unique:true},
						name:     {type: "string"},
						serviceId:{type: "string"},
						isActive: {type: "boolean", defaultValue: true}
					}
				}
			},
			pageSize:  20
		},
		//height:     550,
		filterable: true,
		sortable:   true,
		resizable: true,
		editable:   {
			mode:         "inline",
			confirmation: true
		},
		pageable:   {
			pageSize: 20,
			refresh:  true
		},
		columns:    [{
			field:      "id",
			filterable: false
		},
			{
				field: "fqdn",
				title: "Fqdn"

			},
			{
				field: "name",
				title: "Name"
			},
			{
				field: "serviceId",
				title: "Id"
			},

			{
				field: "isActive",
				title: "Active"
			},
			{command: ["edit", "destroy"], title: "&nbsp;", width: 120}
		]
	});
}