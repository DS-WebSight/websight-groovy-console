package pl.ds.websight.groovyconsole.rest;

public final class Messages {

    // Save script:
    public static final String SAVE_SCRIPT_SUCCESS = "Script saved";
    public static final String SAVE_SCRIPT_SUCCESS_DETAILS = "Script '%s' has been saved";
    public static final String SAVE_SCRIPT_ERROR = "Could not save script";
    public static final String SAVE_SCRIPT_ERROR_DETAILS = "An error occurred while saving script '%s'";

    // Delete script:
    public static final String DELETE_SCRIPT_SUCCESS = "Script deleted";
    public static final String DELETE_SCRIPT_SUCCESS_DETAILS = "Script '%s' has been deleted";
    public static final String DELETE_SCRIPT_ERROR = "Could not delete script";
    public static final String DELETE_SCRIPT_ERROR_NOT_FOUND_DETAILS = "Could not find script '%s'";
    public static final String DELETE_SCRIPT_ERROR_DETAILS = "An error occurred while deleting script '%s'";

    // Get script:
    public static final String GET_SCRIPT_ERROR = "Could not fetch script";
    public static final String GET_SCRIPT_ERROR_NOT_FOUND_DETAILS = "Could not find script '%s'";
    public static final String GET_SCRIPT_ERROR_DETAILS = "An error occurred while fetching script '%s'";

    // Execute script:
    public static final String EXECUTE_SCRIPT_ERROR = "Could not execute script";
    public static final String EXECUTE_SCRIPT_ERROR_UNAUTHORIZED = "You are not authorized to execute scripts";

    // List scripts:
    public static final String LIST_SCRIPTS_ERROR = "Could not list scripts";

    // Get recent scripts:
    public static final String GET_RECENT_SCRIPTS_ERROR = "Could not get recent scripts";

    private Messages() {
        // no instances
    }

    public static String formatMessage(String message, Object... args) {
        return String.format(message, args);
    }
}
