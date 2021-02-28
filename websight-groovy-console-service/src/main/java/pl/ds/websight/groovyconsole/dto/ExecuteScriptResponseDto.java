package pl.ds.websight.groovyconsole.dto;

import java.io.StringWriter;
import java.util.Objects;

public class ExecuteScriptResponseDto {

    private final String result;
    private final String outputText;
    private final String stacktraceText;
    private final String finishedAt;
    private final Long runningTime;

    public ExecuteScriptResponseDto(Object result, StringWriter stringWriter, String stacktraceText, Long runningTime, String finishedAt) {
        this.result = Objects.toString(result, null);
        this.outputText = stringWriter.toString();
        this.stacktraceText = stacktraceText;
        this.runningTime = runningTime;
        this.finishedAt = finishedAt;
    }

    public String getResult() {
        return result;
    }

    public String getOutputText() {
        return outputText;
    }

    public String getStacktraceText() {
        return stacktraceText;
    }

    public Long getRunningTime() {
        return runningTime;
    }

    public String getFinishedAt() {
        return finishedAt;
    }
}
