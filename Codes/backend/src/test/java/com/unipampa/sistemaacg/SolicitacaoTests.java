package com.unipampa.sistemaacg;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
//@AutoConfigureMockMvc
@SpringBootTest
public class SolicitacaoTests {

    @Test
    public void testPadraoMatricula() {

        Pattern pattern = Pattern.compile("[0-9]?[0-9]?0?[0-9]*$");
        Matcher matcher = pattern.matcher("1701560446");
        int matches = 0;
        while (matcher.find()) {
            matches++;
        }

        assertEquals(matches, 2);


    }

}