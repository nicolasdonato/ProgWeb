window.CLASSES = {

		initialize : function(){

		},

		// Appelée à chaque AUTH.loginAccepted()
		connect: function() {

			$("#classes-details-submit-start").click(CLASSES.engageStartCommand);
			$("#classes-details-submit-end").click(CLASSES.engageEndCommand);
			$("#classes-details-submit-join").click(CLASSES.engageJoinCommand);
			$("#classes-details-submit-quit").click(CLASSES.engageQuitCommand);
			$("#classes-details-form").submit(CLASSES.processDetailsCommand);

			CLASSES.list();
			$("#classes-div").show();
			if (AUTH.getRole() >= 2) {
				$("#classes-creation-form").show();
			} else {
				$("#classes-creation-form").hide();
			}
			$("#classes-details-form").hide();
			$("#classes-edition-form").hide();
		},
		
		refreshDetails() {
			
		}
		
};
